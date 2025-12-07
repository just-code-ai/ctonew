import { prisma } from '../db.js';
import { randomUUID } from 'crypto';
import { Meeting, MeetingStatus } from '../generated/prisma/index.js';

export class MeetingService {
  static async createMeeting(
    title: string,
    description: string | undefined,
    hostId: string,
    maxCapacity: number = 50
  ): Promise<Meeting> {
    return await prisma.meeting.create({
      data: {
        title,
        description,
        hostId,
        maxCapacity,
        status: 'SCHEDULED',
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  static async startMeeting(meetingId: string, hostId: string): Promise<Meeting> {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== hostId) {
      throw new Error('Only the host can start the meeting');
    }

    if (meeting.status !== 'SCHEDULED') {
      throw new Error('Meeting can only be started from SCHEDULED status');
    }

    return await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  static async endMeeting(meetingId: string, hostId: string): Promise<Meeting> {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId !== hostId) {
      throw new Error('Only the host can end the meeting');
    }

    if (meeting.status !== 'ACTIVE') {
      throw new Error('Meeting can only be ended from ACTIVE status');
    }

    // Mark all active participants as left
    await prisma.meetingParticipant.updateMany({
      where: {
        meetingId,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });

    return await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  static async joinMeeting(meetingId: string, userId: string): Promise<void> {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.status !== 'ACTIVE') {
      throw new Error('Meeting is not active');
    }

    // Check capacity
    const activeParticipantCount = await prisma.meetingParticipant.count({
      where: {
        meetingId,
        leftAt: null,
      },
    });

    if (activeParticipantCount >= meeting.maxCapacity) {
      throw new Error('Meeting has reached maximum capacity');
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.meetingParticipant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      if (existingParticipant.leftAt === null) {
        throw new Error('User is already in the meeting');
      }
      // Rejoin the meeting
      await prisma.meetingParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          joinedAt: new Date(),
          leftAt: null,
        },
      });
    } else {
      // Join for the first time
      await prisma.meetingParticipant.create({
        data: {
          meetingId,
          userId,
        },
      });
    }
  }

  static async leaveMeeting(meetingId: string, userId: string): Promise<void> {
    const participant = await prisma.meetingParticipant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    });

    if (!participant || participant.leftAt !== null) {
      throw new Error('User is not in the meeting');
    }

    await prisma.meetingParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
      },
    });
  }

  static async getActiveMeetings(): Promise<Meeting[]> {
    return await prisma.meeting.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: {
              where: {
                leftAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getMeetingById(meetingId: string): Promise<Meeting | null> {
    return await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          where: {
            leftAt: null,
          },
        },
      },
    });
  }

  static async createSessionToken(userId: string, meetingId?: string): Promise<{ token: string; expiresAt: Date }> {
    const session = await prisma.session.create({
      data: {
        token: randomUUID(),
        userId,
        meetingId,
      },
      select: {
        token: true,
        expiresAt: true,
      },
    });

    return session;
  }
}