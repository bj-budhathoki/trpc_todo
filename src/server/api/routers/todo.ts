import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const todos = await prisma.todo.findMany({
      where: {
        userId: session?.user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return todos;
  }),
  create: protectedProcedure
    .input(
      z.object({
        text: z
          .string({
            required_error: "Enter your todo",
          })
          .min(1)
          .max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      return prisma.todo.create({
        data: {
          text: input.text,
          user: {
            connect: {
              id: session?.user?.id,
            },
          },
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.delete({
        where: {
          id: input,
        },
      });
    }),
  toggle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        done: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: {
          id: input?.id,
        },
        data: {
          done: input.done,
        },
      });
    }),
});
