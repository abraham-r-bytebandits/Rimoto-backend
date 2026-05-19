import { ActionSeverity } from '@prisma/client';
import prisma from '@/lib/prisma';

interface LogEntry {
  actorId: string;
  actionType: string;
  actionSeverity: 'SUCCESS' | 'WARNING' | 'DANGER';
  message: string;
}

export async function log({ actorId, actionType, actionSeverity, message }: LogEntry) {
  return prisma.adminLog.create({
    data: {
      actorId,
      actionType,
      actionSeverity: actionSeverity as ActionSeverity,
      message,
    },
  });
}
