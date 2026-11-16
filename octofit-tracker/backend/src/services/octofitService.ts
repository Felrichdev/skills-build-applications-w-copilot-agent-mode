import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Activity payload is required');
  }

  const payload = input as Record<string, unknown>;
  const userId = payload.userId;
  const teamId = payload.teamId;
  const type = typeof payload.type === 'string' ? payload.type.trim() : '';
  const minutes = Number(payload.minutes);

  if (!userId || typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
    throw badRequest('userId must be a valid ObjectId');
  }

  if (!teamId || typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) {
    throw badRequest('teamId must be a valid ObjectId');
  }

  if (!type) {
    throw badRequest('type is required');
  }

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw badRequest('minutes must be a positive number');
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw badRequest('userId does not match an existing user');
  }

  const existingTeam = await Team.findById(teamId);
  if (!existingTeam) {
    throw badRequest('teamId does not match an existing team');
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: Math.max(1, Math.round(minutes)),
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Team payload is required');
  }

  const payload = input as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const mascot = typeof payload.mascot === 'string' ? payload.mascot.trim() : '';
  const membersInput = payload.members;

  if (!name) {
    throw badRequest('name is required');
  }

  if (!mascot) {
    throw badRequest('mascot is required');
  }

  let members: string[] = [];
  if (membersInput !== undefined) {
    if (!Array.isArray(membersInput)) {
      throw badRequest('members must be an array of user IDs');
    }

    members = membersInput.map((member) => {
      if (typeof member !== 'string' || !mongoose.isValidObjectId(member)) {
        throw badRequest('members must contain valid user ObjectIds');
      }
      return member;
    });
  }

  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    throw Object.assign(new Error('No user matches that email'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const userGoal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.trim().toLowerCase() : '';
  const recentType = recentActivity && typeof recentActivity.type === 'string' ? recentActivity.type.trim().toLowerCase() : '';

  const workouts = await Workout.find().lean();

  const suggestions = workouts
    .map((workout) => {
      const focus = typeof workout.focus === 'string' ? workout.focus.toLowerCase() : '';
      let score = 0;

      if (userGoal && focus === userGoal) score += 3;
      if (recentType && focus === recentType) score += 2;
      if (!userGoal && !recentType) score += 1;

      const reasonBase = userGoal ? `Supports your ${userGoal} goal` : 'Matches your activity pattern';
      const reasonRecent = recentType ? ` and recent ${recentType} activity` : '';
      const reason = `${reasonBase}${reasonRecent}.`;

      return { ...workout, score, reason };
    })
    .sort((left, right) => right.score - left.score || String(left.title).localeCompare(String(right.title)))
    .map((workout) => ({
      title: workout.title,
      focus: workout.focus,
      minutes: workout.minutes,
      difficulty: workout.difficulty,
      reason: workout.reason,
    }));

  return suggestions;
}

export { User };
