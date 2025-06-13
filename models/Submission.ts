import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: String,
    topic: String,
    questions: Array,
    answers: Object,
    score: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Submission ||
  mongoose.model("Submission", submissionSchema);
