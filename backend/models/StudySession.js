import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true }
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    relationship: { type: String, default: '' }
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    explanation: { type: String, required: true },
    concept: { type: String, required: true }
  },
  { _id: false }
);

const answerResultSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const weakTopicSchema = new mongoose.Schema(
  {
    concept: { type: String, required: true },
    status: { type: String, required: true }
  },
  { _id: false }
);

const targetedRevisionSchema = new mongoose.Schema(
  {
    topic: { type: String },
    summary: { type: String },
    flashcards: [flashcardSchema],
    questions: [
      {
        question: { type: String },
        answer: { type: String },
        explanation: { type: String }
      }
    ]
  },
  { _id: false }
);

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    notes: {
      type: String,
      required: [true, 'Notes are required']
    },
    difficulty: {
      type: String,
      default: 'Intermediate'
    },
    learningStyle: {
      type: String,
      default: 'Simple Explanation'
    },
    summary: {
      type: String,
      required: true
    },
    keyPoints: [
      {
        type: String
      }
    ],
    flashcards: [flashcardSchema],
    knowledgeMap: {
      nodes: [nodeSchema],
      edges: [edgeSchema]
    },
    quiz: [quizQuestionSchema],
    quizResult: {
      score: { type: Number },
      total: { type: Number },
      percentage: { type: Number },
      answers: [answerResultSchema]
    },
    weakTopics: [weakTopicSchema],
    targetedRevision: targetedRevisionSchema
  },
  {
    timestamps: true
  }
);

studySessionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;
