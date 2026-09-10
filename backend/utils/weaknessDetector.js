/**
 * Deterministically analyzes quiz results by concept
 * @param {Array} quizQuestions - Original quiz array with concept & answer fields
 * @param {Array} userAnswers - User submitted answers [{ questionIndex, selectedAnswer }]
 * @returns {Object} { score, total, percentage, answerDetails, weakTopics }
 */
export const calculateQuizAnalysis = (quizQuestions, userAnswers) => {
  let score = 0;
  const total = quizQuestions.length;
  const answerDetails = [];
  const conceptStats = {};

  userAnswers.forEach((ans) => {
    const qIndex = ans.questionIndex;
    const questionObj = quizQuestions[qIndex];
    if (!questionObj) return;

    const isCorrect = ans.selectedAnswer.trim().toLowerCase() === questionObj.answer.trim().toLowerCase();
    if (isCorrect) {
      score++;
    }

    answerDetails.push({
      questionIndex: qIndex,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: questionObj.answer,
      isCorrect
    });

    const concept = questionObj.concept || 'General Concept';
    if (!conceptStats[concept]) {
      conceptStats[concept] = { total: 0, correct: 0 };
    }
    conceptStats[concept].total += 1;
    if (isCorrect) {
      conceptStats[concept].correct += 1;
    }
  });

  const percentage = Math.round((score / total) * 100);

  const weakTopics = Object.keys(conceptStats).map((concept) => {
    const { total: cTotal, correct: cCorrect } = conceptStats[concept];
    let status = 'Strong';
    if (cCorrect === 0) {
      status = 'Weak';
    } else if (cCorrect < cTotal) {
      status = 'Needs Revision';
    } else {
      status = 'Strong';
    }

    return {
      concept,
      status
    };
  });

  return {
    score,
    total,
    percentage,
    answers: answerDetails,
    weakTopics
  };
};
