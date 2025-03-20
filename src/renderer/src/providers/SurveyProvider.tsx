import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { useTracking } from "@renderer/analytics";
import useWebviewArranger from "@renderer/hooks/useWebviewArranger";
import { SurveyForm, type Survey } from "@renderer/Survey";

import { FROM_NODE_TRIGGER_SURVEY } from "@src/const/events";

// eslint-disable-next-line
//const deprecated_afterGamePlay: Survey = {
//  id: "end_game_session_survey_20240920",
//  title: "shareWithNexus",
//  description: "We value your feedback!",
//  questions: [
//    {
//      id: "customer_satisfaction_20240920",
//      description: "customerSatisfaction",
//      type: "Rating",
//      min: 1,
//      max: 10,
//      minDescription: "notSatisfiedAtAll",
//      maxDescription: "verySatisfied",
//    },
//    {
//      id: "customer_effort_score_login_and_signup_20240920",
//      description: "customerEffortScoreLoginAndSignup",
//      type: "Rating",
//      min: 1,
//      max: 7,
//      minDescription: "veryHard",
//      maxDescription: "veryEasy",
//    },
//    {
//      id: "customer_effort_score_download_and_play_game_20240920",
//      description: "customerEffortScoreDownloadAndPlayGame",
//      type: "Rating",
//      min: 1,
//      max: 7,
//      minDescription: "veryHard",
//      maxDescription: "veryEasy",
//    },
//    {
//      id: "customer_feedback_20240920",
//      description: "feedback",
//      type: "Text",
//      placeholder: "feedbackForChanges",
//    },
//  ],
//};

const afterGamePlayV2: Survey = {
  id: "end_game_session_survey_20241205",
  title: "shareWithNexus",
  description: "We value your feedback!",
  questions: [
    {
      id: "customer_satisfaction_20241205",
      description: "customerSatisfaction",
      type: "Rating",
      min: 1,
      max: 10,
      minDescription: "notSatisfiedAtAll",
      maxDescription: "verySatisfied",
    },
    {
      id: "customer_feedback_20241205",
      description: "feedback",
      type: "Text",
      placeholder: "feedbackForChanges",
    },
  ],
};

const surveys = {
  afterGamePlayV2,
} as const;
type SupportedSurvey = keyof typeof surveys;

const SurveyContext = createContext<{
  triggerOpenSurvey: (survey: SupportedSurvey) => void;
}>({
  triggerOpenSurvey: () => {},
});

export const SurveyProvider = ({ children }: PropsWithChildren<object>): JSX.Element => {
  const [currentSurvey, _setCurrentSurvey] = useState<SupportedSurvey | "">("");
  const { onFocusAppNavBar } = useWebviewArranger();
  const setCurrentSurvey = useCallback(
    (survey: SupportedSurvey | "") => {
      _setCurrentSurvey(survey);
      onFocusAppNavBar(Boolean(survey));
    },
    [onFocusAppNavBar],
  );

  const { track } = useTracking();

  const triggerOpenSurvey = useCallback(
    (surveyKey: SupportedSurvey) => {
      setCurrentSurvey(surveyKey);
      track({
        name: "show_survey",
        payload: { surveyId: surveys[surveyKey].id },
      });
    },
    [track, setCurrentSurvey],
  );
  const contextValue = useMemo(() => {
    return { triggerOpenSurvey };
  }, [triggerOpenSurvey]);

  useEffect(() => {
    return window.api.app_addListener(FROM_NODE_TRIGGER_SURVEY, () => {
      triggerOpenSurvey("afterGamePlayV2");
    });
  }, [triggerOpenSurvey]);

  return (
    <SurveyContext.Provider value={contextValue}>
      {currentSurvey ? (
        <SurveyForm
          survey={surveys[currentSurvey]}
          onSubmitAnswer={() => {
            window.api.survey_submitQuestionAnswer();
          }}
          onClose={(questionId) => {
            track({
              name: "close_survey",
              payload: { surveyId: surveys[currentSurvey].id, questionId },
            });
            setCurrentSurvey("");
          }}
        />
      ) : null}
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyProvider = () => {
  const contextValue = useContext(SurveyContext);

  return contextValue;
};
