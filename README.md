<img src="https://docs.nestjs.com/assets/logo-small.svg" width="128px" />

# NestJS Starter

A NestJS starter template with Database and Authentication Scaffolding

### Features

- `.env` validation (using dotenv and Joi)
- Local & JWT Authentication (using Passport)
- PostgresDB Database Management (using TypeORM)
- Forgot Password / Reset Password flows, with emails (using Nodemailer)
- Dynamic Email Templates (using handlebars)

### How to Run?

- Clone the repository and `cd` into the project directory
- Copy `.env.example` to `.env` and populate with your respective secrets
- Fire up PostgresDB through Docker by running `docker compose up -d`
- Install project dependencies by running `yarn install` (or `npm install`)
- Run the server locally in debug mode, by running `yarn start:dev` (or `npm run start:dev`)
- When you are ready to deploy, build the project using `yarn build` (or `npm run build`)
