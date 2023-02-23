import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Todo } from "../models/Todo";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const XAWS = AWSXRay.captureAWS(AWS);

// class for all the data layers which are used to access the dynamodb tables the business logic instantiate this class 
export class TodoAccess {
  // attributes in the constructor are from the environment and docClient create new client to access the database
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.TODO_USER_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.S3_URL_EXPIRATION,
    private readonly s3 = new XAWS.S3({
      signatureVersion: "v4",
    })
  ) {}
    // query all users todo from the database
  async getAllTodosForUser(userId: String): Promise<any> {
    const result = this.docClient
      .query({
        TableName: this.todoTable,
        IndexName: this.todoIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();

    return result;
  }

  // new todo on the table
  async createTodo(todo: Todo): Promise<Todo> {
    this.docClient
      .put({
        TableName: this.todoTable,
        Item: todo,
      })
      .promise();

    return todo;
  }

  async updateTodo(
    todoId: String,
    updatedTodo: UpdateTodoRequest,
    userId: String
  ): Promise<void> {
    console.log("Updating todoId: ", todoId, " userId: ", userId);

    this.docClient.update(
      {
        TableName: this.todoTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: "set #name = :n, #dueDate = :due, #done = :d",
        ExpressionAttributeValues: {
          ":n": updatedTodo.name,
          ":due": updatedTodo.dueDate,
          ":d": updatedTodo.done,
        },
        ExpressionAttributeNames: {
          "#name": "name",
          "#dueDate": "dueDate",
          "#done": "done",
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
  }

  async deleteTodo(todoId: String, userId: String): Promise<void> {
    this.docClient.delete(
      {
        TableName: this.todoTable,
        Key: {
          todoId,
          userId,
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element deleted " + data);
        }
      }
    );
  }
  async getPresignedImageUrl(
    todoId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
    const attachmentUrl = await this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration,
    });

    this.docClient.update(
      {
        TableName: this.todoTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
    return attachmentUrl;
  }
}

// creates new client to online deployed database ,if the environment variable IS_OFFLINE true it will create to the offline local version of the database
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
