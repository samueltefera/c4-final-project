import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { createTodo } from "../../businessLogic/todo";
import { decodeJWTFromAPIGatewayEvent } from "../../auth/utils";
import * as uuid from "uuid";
import { parseUserId } from "../../auth/utils";
import { createLogger } from "../../utils/logger";
const logger = createLogger("todo");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // this line when the http event hits the function
    console.log("Processing event: ", event);

    // filters the event body send from the request 
    const todoRequest: CreateTodoRequest = JSON.parse(event.body);
    // create id for the todo from uuid looks like this 82813b0e-7eb2-40ec-88c1-f9f452e6a327
    const todoId = uuid.v4();
    
    const jwtToken = decodeJWTFromAPIGatewayEvent(event);

    const userId = parseUserId(jwtToken);

    const newTodo = await createTodo(todoId, todoRequest, userId);

    logger.info("todo CREATED", {
      // Additional information stored with a log statement
      key: todoId,
      userId: userId,
      date: new Date().toISOString,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodo,
      }),
    };
  }
);

handler
  .use(
    cors({
      credentials: true,
    })
  )
  .use(httpErrorHandler());
