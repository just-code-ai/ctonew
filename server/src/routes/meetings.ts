import { Router, Request, Response, NextFunction } from 'express';
import { MeetingService } from '../services/meetingService.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Create meeting
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, maxCapacity } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const meeting = await MeetingService.createMeeting(
      title,
      description,
      req.user!.id,
      maxCapacity
    );
    
    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

// Start meeting
router.post('/:id/start', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.startMeeting(req.params.id, req.user!.id);
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

// End meeting
router.post('/:id/end', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.endMeeting(req.params.id, req.user!.id);
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

// Join meeting
router.post('/:id/join', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await MeetingService.joinMeeting(req.params.id, req.user!.id);
    
    const session = await MeetingService.createSessionToken(req.user!.id, req.params.id);
    
    res.json({
      message: 'Successfully joined meeting',
      sessionToken: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    next(error);
  }
});

// Leave meeting
router.post('/:id/leave', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await MeetingService.leaveMeeting(req.params.id, req.user!.id);
    res.json({ message: 'Successfully left meeting' });
  } catch (error) {
    next(error);
  }
});

// Get active meetings
router.get('/active', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meetings = await MeetingService.getActiveMeetings();
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

// Get meeting by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.getMeetingById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

export default router;