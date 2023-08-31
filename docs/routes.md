# API routes

| domain | route                              | method | description                | TODO | Module                         |
| ------ | ---------------------------------- | ------ | -------------------------- | ---- | ------------------------------ |
| auth   | /auth/register                     | POST   | register an user           |      | Auth                           |
| auth   | /auth/login                        | POST   | login an user              |      | Auth                           |
| auth   | /auth/me                           | GET    | get current user           | x    | **currently in Users** -> Auth |
| users  | /users/:id                         | GET    | get user by id             |      | Users                          |
| users  | /users/:id/workspaces              | GET    | get workspaces of user     | x    | Workspaces                     |
| users  | /users/:id/workspaces/:workspaceId | DELETE | remove user from workspace | x    | Workspaces                     |
| users  | /users/:id/invites                 | GET    | get invites of users       | x    | Workspaces                     |
| users  | /users/:id/invites/:inviteId       | PATCH  | Accept or reject an invite | x    | Workspaces                     |
