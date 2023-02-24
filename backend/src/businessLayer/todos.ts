import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';


// TODO: Implement businessLogic
const logger = createLogger('Todos')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
) {
    logger.info('creating todo', { createTodoRequest, userId })
    const todoId = uuid.v4()
    const todo: TodoItem = {
        todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: undefined
    }

    const createdTodo = await todosAccess.createTodo(todo)

    return createdTodo

}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> 
    {
    logger.info('getting todos for user', { userId })
    var todos = await todosAccess.getTodoByUser(userId)
    todos.forEach(e => e.attachmentUrl = attachmentUtils.getAttachmentImageUrl(e.todoId))
    return todos as TodoItem[]

}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string
) {
    logger.info('updating todo', { todoId, updateTodoRequest, userId })
    
    const updatedTodo: TodoUpdate = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
    }

    const updatedTodoItem = await todosAccess.updateTodo(todoId, userId, updatedTodo)

    return updatedTodoItem

}

export async function deleteTodo(
    todoId: string, userId: string) {
    logger.info('deleting todo', { todoId, userId })
    return await todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
    todoId: string, userId: string
    ) {
    logger.info('creating url', { todoId, userId })
    const attachmentUrl = await attachmentUtils.getAttachmentImageUrl(todoId)
    return attachmentUrl
    
}