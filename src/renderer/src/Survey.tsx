import { useState } from "react";

import { useTracking } from "./analytics";
import type { RatingsQuestionIds, SurveyQuestionIds, TextQuestionIds } from "./analytics/types";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Progress } from "./components/ui/progress";
import { CommentRatings } from "./components/ui/ratings";
import { Textarea } from "./components/ui/textarea";
import { useTranslation } from "./i18n/useTranslation";

type QuestionType = "Rating" | "Text";

interface BaseQuestion {
  description:
    | "customerSatisfaction"
    | "customerEffortScoreLoginAndSignup"
    | "customerEffortScoreDownloadAndPlayGame"
    | "feedback";
  type: QuestionType;
}

interface RatingQuestion extends BaseQuestion {
  id: RatingsQuestionIds;
  type: "Rating";
  min: number;
  max: number;
  minDescription: "notSatisfiedAtAll" | "veryHard";
  maxDescription: "verySatisfied" | "veryEasy";
}

interface TextQuestion extends BaseQuestion {
  id: TextQuestionIds;
  type: "Text";
  placeholder: "feedbackForChanges";
}

type Question = RatingQuestion | TextQuestion;

export interface Survey {
  id: string;
  title: "shareWithNexus";
  description: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: number | string;
}

const TextQuestionForm = ({
  question,
  onSubmit,
  surveyId,
}: {
  question: TextQuestion;
  onSubmit: (value: string) => void;
  surveyId: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const { track } = useTracking();
  return (
    <div className="w-full">
      <Textarea
        className="h-24 w-full"
        placeholder={t(`survey.${question.placeholder}`)}
        required
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      ></Textarea>
      <div className="float-right mt-4">
        <Button
          variant="white"
          className="px-[22.5px] py-0.5 !font-bold uppercase"
          onClick={() => {
            track({
              name: "survey_answer",
              payload: {
                surveyId,
                questionId: question.id,
                answer: value,
              },
            });
            onSubmit(value);
          }}
        >
          {t("survey.send")}
        </Button>
      </div>
    </div>
  );
};

const RatingsQuestionForm = ({
  question,
  handleRatingSubmit,
  surveyId,
}: {
  question: RatingQuestion;
  handleRatingSubmit: (rating: number) => void;
  surveyId: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const { track } = useTracking();
  return (
    <div className="mb-10">
      <CommentRatings
        key={question.id}
        rating={0}
        totalStars={question.max}
        onRatingChange={(rating) => {
          track({
            name: "survey_answer",
            payload: {
              surveyId,
              questionId: question.id,
              answer: rating,
            },
          });

          handleRatingSubmit(rating);
        }}
      />
      <div className="mt-4 flex gap-4">
        <Label className="caption-12-regular">
          {question.min} = {t(`survey.${question.minDescription}`)}
        </Label>
        <Label className="caption-12-regular">
          {question.max} = {t(`survey.${question.maxDescription}`)}
        </Label>
      </div>
    </div>
  );
};
export const SurveyForm = ({
  survey,
  onSubmitAnswer,
  onClose,
}: {
  survey: Survey;
  onSubmitAnswer: () => void;
  onClose: (questionId: SurveyQuestionIds) => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(new Array(survey.questions.length).fill(null));

  const handleRatingSubmit = (answer: number): void => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      questionId: survey.questions[currentQuestionIndex].id,
      answer,
    };

    setAnswers(updatedAnswers);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    onSubmitAnswer();
  };

  const handleTextSubmit = (answer: string): void => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      questionId: survey.questions[currentQuestionIndex].id,
      answer,
    };
    setAnswers(updatedAnswers);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    onSubmitAnswer();
  };

  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <Dialog
      open
      onOpenChange={() => {
        onClose(
          currentQuestionIndex < survey.questions.length
            ? survey.questions[currentQuestionIndex].id
            : "thankyou",
        );
      }}
    >
      <DialogContent
        className="w-[450px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {currentQuestionIndex < survey.questions.length ? (
          <div>
            <div className="absolute left-6 top-2">
              {survey.questions.map((_, index) => (
                <Progress
                  key={index}
                  value={currentQuestionIndex >= index ? 100 : 0}
                  className="mr-2 inline-block w-[60px]"
                  variant="white"
                  size="tiny"
                />
              ))}
            </div>

            <img
              src="https://cdn-nexus.vnggames.com/assets/images/common/survey-star.svg"
              alt=""
              className="mt-8 h-[108px] w-[216px]"
            ></img>
            <DialogTitle className="body-14-regular mb-1 text-neutral-300">
              {t(`survey.${survey.title}`)}
            </DialogTitle>

            <p className="heading-4 mb-4">{t(`survey.${currentQuestion.description}`)}</p>
            {currentQuestion.type === "Rating" ? (
              <RatingsQuestionForm
                question={currentQuestion}
                handleRatingSubmit={handleRatingSubmit}
                surveyId={survey.id}
              />
            ) : (
              <TextQuestionForm
                question={currentQuestion}
                onSubmit={handleTextSubmit}
                surveyId={survey.id}
              />
            )}
          </div>
        ) : (
          <div className="mb-10">
            <img
              src="https://cdn-nexus.vnggames.com/assets/images/common/survey_end.gif"
              alt=""
              className="m-auto h-[217px] w-[217px] py-2"
            ></img>
            <p className="heading-4 mb-1">{t("survey.thankYou")}</p>
            <Label className="body-14-regular">{t("survey.thankYouDescription")}</Label>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
