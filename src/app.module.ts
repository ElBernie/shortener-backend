import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import PrismaModule from './Prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import AuthModule from './Auth/auth.module';
import UsersModule from './Users/users.module';
import LinksModule from './Links/links.module';
import WorkspacesModule from './Workspaces/workspaces.module';
import { InfluxModule } from '@sunbzh/nest-influx';

@Module({
  imports: [
    ConfigModule.forRoot(),
    InfluxModule.forRoot({
      url: process.env.INFLUX_URL,
      token: process.env.INFLUX_TOKEN,
    }),
    MailerModule.forRoot({
      transport: `smtp://${process.env.SMTP_USER}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`,
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    LinksModule,
    WorkspacesModule,
  ],
})
export class AppModule {}
