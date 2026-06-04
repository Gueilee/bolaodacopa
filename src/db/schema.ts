import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['admin', 'rh', 'user'] })
      .notNull()
      .default('user'),
    avatarUrl:         text('avatar_url'),
    department:        text('department'),
    // WhatsApp: número no formato 5511999999999 (sem + ou espaços)
    phone:             text('phone'),
    whatsappOptIn:     integer('whatsapp_opt_in', { mode: 'boolean' }).notNull().default(false),
    manager:       text('manager'),
    firstAccessAt: integer('first_access_at', { mode: 'timestamp' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    totalPoints: integer('total_points').notNull().default(0),
    // Registro único: ao finalizar, todos os palpites ficam imutáveis
    isPredictionLocked: integer('is_prediction_locked', { mode: 'boolean' }).notNull().default(false),
    predictionsLockedAt: integer('predictions_locked_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
  })
)

// ─────────────────────────────────────────────
// MATCHES
// ─────────────────────────────────────────────
export const matches = sqliteTable(
  'matches',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    phase: text('phase', {
      enum: [
        'group',
        'round_of_32',
        'round_of_16',
        'quarter_final',
        'semi_final',
        'third_place',
        'final',
      ],
    }).notNull(),
    // Populated only for group stage
    groupName: text('group_name'),
    matchNumber: integer('match_number').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    homeFlag: text('home_flag'), // emoji or URL
    awayFlag: text('away_flag'),
    // Filled after match ends
    homeScore: integer('home_score'),
    awayScore: integer('away_score'),
    // AET = after extra time, PEN = after penalties (for display only;
    // bolão score always uses the 90-min result stored in homeScore/awayScore)
    matchResult: text('match_result', { enum: ['FT', 'AET', 'PEN'] }),
    matchDate: integer('match_date', { mode: 'timestamp' }).notNull(),
    venue: text('venue'),
    city: text('city'),
    status: text('status', { enum: ['upcoming', 'live', 'finished'] })
      .notNull()
      .default('upcoming'),
    // Live match elapsed minutes (from API)
    elapsed: integer('elapsed'),
    isScored: integer('is_scored', { mode: 'boolean' }).notNull().default(false),
    // API-Football fixture ID — set on first sync, used for fast lookups
    apiFixtureId: integer('api_fixture_id'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    statusIdx:    index('matches_status_idx').on(t.status),
    dateIdx:      index('matches_date_idx').on(t.matchDate),
    apiFixtureIdx: index('matches_api_fixture_idx').on(t.apiFixtureId),
  })
)

// ─────────────────────────────────────────────
// PREDICTIONS (per match)
// ─────────────────────────────────────────────
export const predictions = sqliteTable(
  'predictions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    matchId: text('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    homeScore: integer('home_score').notNull(),
    awayScore: integer('away_score').notNull(),
    // Calculated and stored after the match ends
    points: integer('points').notNull().default(0),
    pointsBreakdown: text('points_breakdown'),
    isScored: integer('is_scored', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    // Each user can have only one prediction per match
    uniquePrediction: uniqueIndex('predictions_user_match_idx').on(t.userId, t.matchId),
    userIdx: index('predictions_user_idx').on(t.userId),
    matchIdx: index('predictions_match_idx').on(t.matchId),
  })
)

// ─────────────────────────────────────────────
// TOURNAMENT PREDICTIONS (bonus bets)
// Champion, Runner-up, Top Scorer — one per user
// ─────────────────────────────────────────────
export const tournamentPredictions = sqliteTable('tournament_predictions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  champion: text('champion').notNull(),
  runnerUp: text('runner_up').notNull(),
  topScorer: text('top_scorer').notNull(), // player name
  // Bonus points awarded once tournament ends
  bonusPoints: integer('bonus_points').notNull().default(0),
  isScored: integer('is_scored', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

// ─────────────────────────────────────────────
// SETTINGS (key-value store for system config)
// Keys used: "champion", "runner_up", "top_scorer",
//            "tournament_locked", "scoring_rules_version"
// ─────────────────────────────────────────────
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
  label: text('label'), // human-readable description
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// NOTIFICATIONS LOG
// ─────────────────────────────────────────────
export const notificationsLog = sqliteTable(
  'notifications_log',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:  text('user_id').references(() => users.id, { onDelete: 'set null' }),
    matchId: text('match_id').references(() => matches.id, { onDelete: 'set null' }),
    type: text('type', {
      enum: [
        'reminder_daily',     // lembrete pré-Copa
        'reminder_match',     // lembrete 2h antes do jogo
        'result',             // resultado + pontos
        'ranking_update',     // subiu no ranking
        'custom',             // envio manual do admin
      ],
    }).notNull(),
    phone:   text('phone').notNull(),
    message: text('message').notNull(),
    status:  text('status', { enum: ['sent', 'failed', 'skipped'] }).notNull(),
    error:   text('error'),
    sentAt:  integer('sent_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    userIdx:  index('notif_user_idx').on(t.userId),
    typeIdx:  index('notif_type_idx').on(t.type),
    sentIdx:  index('notif_sent_idx').on(t.sentAt),
  }),
)

// ─────────────────────────────────────────────
// MURAL SOCIAL — postagens e curtidas
// ─────────────────────────────────────────────
export const socialPosts = sqliteTable(
  'social_posts',
  {
    id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content:   text('content'),
    mediaUrl:  text('media_url'),
    mediaType: text('media_type', { enum: ['image', 'video', 'text'] }).notNull().default('text'),
    likesCount:    integer('likes_count').notNull().default(0),
    commentsCount: integer('comments_count').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    userIdx:    index('social_posts_user_idx').on(t.userId),
    createdIdx: index('social_posts_created_idx').on(t.createdAt),
  }),
)

export const socialLikes = sqliteTable(
  'social_likes',
  {
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    postId:    text('post_id').notNull().references(() => socialPosts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    pk: uniqueIndex('social_likes_pk').on(t.userId, t.postId),
  }),
)

// ─────────────────────────────────────────────
// USER TOKENS — convites e reset de senha
// ─────────────────────────────────────────────
export const userTokens = sqliteTable(
  'user_tokens',
  {
    id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token:     text('token').notNull(),
    type:      text('type', { enum: ['invite', 'password_reset'] }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    usedAt:    integer('used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    tokenIdx:  uniqueIndex('user_tokens_token_idx').on(t.token),
    userIdx:   index('user_tokens_user_idx').on(t.userId),
  }),
)

export type UserToken    = typeof userTokens.$inferSelect
export type NewUserToken = typeof userTokens.$inferInsert

// ─────────────────────────────────────────────
// SOCIAL COMMENTS
// ─────────────────────────────────────────────
export const socialComments = sqliteTable(
  'social_comments',
  {
    id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId:    text('post_id').notNull().references(() => socialPosts.id, { onDelete: 'cascade' }),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content:   text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    postIdx: index('social_comments_post_idx').on(t.postId),
    userIdx: index('social_comments_user_idx').on(t.userId),
  }),
)

export type SocialComment    = typeof socialComments.$inferSelect
export type NewSocialComment = typeof socialComments.$inferInsert

// ─── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  predictions: many(predictions),
  tournamentPrediction: one(tournamentPredictions, {
    fields: [users.id],
    references: [tournamentPredictions.userId],
  }),
  socialPosts: many(socialPosts),
  socialLikes: many(socialLikes),
}))

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  user:     one(users, { fields: [socialPosts.userId], references: [users.id] }),
  likes:    many(socialLikes),
  comments: many(socialComments),
}))

export const socialCommentsRelations = relations(socialComments, ({ one }) => ({
  post: one(socialPosts, { fields: [socialComments.postId], references: [socialPosts.id] }),
  user: one(users,       { fields: [socialComments.userId], references: [users.id] }),
}))

export const socialLikesRelations = relations(socialLikes, ({ one }) => ({
  user: one(users, { fields: [socialLikes.userId], references: [users.id] }),
  post: one(socialPosts, { fields: [socialLikes.postId], references: [socialPosts.id] }),
}))

// ─────────────────────────────────────────────
// MATCH GOALS — gols por jogador por partida
// ─────────────────────────────────────────────
export const matchGoals = sqliteTable(
  'match_goals',
  {
    id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    matchId:    text('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
    playerName: text('player_name').notNull(),
    country:    text('country').notNull(),
    isOwnGoal:  integer('is_own_goal', { mode: 'boolean' }).notNull().default(false),
    minute:     integer('minute'),
    createdAt:  integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({
    matchIdx: index('match_goals_match_idx').on(t.matchId),
  }),
)

export type MatchGoal    = typeof matchGoals.$inferSelect
export type NewMatchGoal = typeof matchGoals.$inferInsert

export const matchGoalsRelations = relations(matchGoals, ({ one }) => ({
  match: one(matches, { fields: [matchGoals.matchId], references: [matches.id] }),
}))

export const matchesRelations = relations(matches, ({ many }) => ({
  predictions: many(predictions),
  goals:       many(matchGoals),
}))

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, { fields: [predictions.userId], references: [users.id] }),
  match: one(matches, { fields: [predictions.matchId], references: [matches.id] }),
}))

export const tournamentPredictionsRelations = relations(tournamentPredictions, ({ one }) => ({
  user: one(users, { fields: [tournamentPredictions.userId], references: [users.id] }),
}))

// ─────────────────────────────────────────────
// INFERRED TYPES
// ─────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Match = typeof matches.$inferSelect
export type NewMatch = typeof matches.$inferInsert
export type Prediction = typeof predictions.$inferSelect
export type NewPrediction = typeof predictions.$inferInsert
export type TournamentPrediction = typeof tournamentPredictions.$inferSelect
export type NewTournamentPrediction = typeof tournamentPredictions.$inferInsert
export type Setting = typeof settings.$inferSelect
export type SocialPost = typeof socialPosts.$inferSelect
export type SocialLike = typeof socialLikes.$inferSelect
