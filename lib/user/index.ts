// User module exports
export { UserRepository } from '../repositories/user-repository'
export { UserService, type UserServiceConfig } from '../services/user-service'
export { 
  type DatabaseUser, 
  type UserData, 
  type UserUpdateData 
} from '../types/user'