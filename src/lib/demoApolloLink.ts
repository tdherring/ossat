import { ApolloLink, Observable, type Operation } from "@apollo/client";
import { print } from "graphql";
import { demoAssessmentsByUser, demoOrganisations, demoUser, getDemoQuestions } from "./demoData";

const sourceValue = (source: string, name: string) =>
  source.match(new RegExp(`${name}:\\s*"([^"]+)"`))?.[1];

const responseFor = (operation: Operation): Record<string, unknown> => {
  const source = print(operation.query);
  const { operationName, variables } = operation;

  if (operationName === "GetUserInfo") return { me: demoUser };
  if (operationName === "GetOrganisations") return { getOrganisations: demoOrganisations };

  if (operationName === "GetAssessments") {
    const username =
      typeof variables.username === "string"
        ? variables.username
        : (sourceValue(source, "username") ?? demoUser.username);
    const variant =
      typeof variables.variant === "string" ? variables.variant : sourceValue(source, "variant");
    const assessments = demoAssessmentsByUser[username] ?? demoAssessmentsByUser[demoUser.username];
    return {
      getAssessments: variant
        ? assessments.filter((item) => item.variant === variant)
        : assessments,
    };
  }

  if (operationName === "GetQuestions") {
    const assessmentId =
      typeof variables.assessmentId === "string"
        ? variables.assessmentId
        : sourceValue(source, "assessmentId");
    return { getQuestions: getDemoQuestions(assessmentId) };
  }

  if (operationName === "SetQuestionAnswer") {
    return { setQuestionAnswer: { question: { selectedAnswer: variables.answer } } };
  }
  if (operationName === "SubmitAssessment")
    return { submitAssessment: { assessment: { submitted: true } } };
  if (operationName === "CreateOrganisation")
    return {
      createOrganisation: { success: true, errors: null, organisation: { name: variables.name } },
    };
  if (operationName === "joinOrganisation")
    return {
      joinOrganisation: { success: true, errors: null, organisation: demoOrganisations[0] },
    };
  if (operationName === "DeleteOrganisation")
    return { deleteOrganisation: { success: true, errors: null } };
  if (operationName === "KickOrganisationMember") {
    const organisation =
      demoOrganisations.find(({ name }) => name === variables.orgName) ?? demoOrganisations[0];
    return {
      kickOrganisationMember: {
        success: true,
        errors: null,
        organisation: {
          members: organisation.members.filter(({ username }) => username !== variables.username),
        },
      },
    };
  }
  if (operationName === "PromoteOrganisationMember") {
    const organisation =
      demoOrganisations.find(({ name }) => name === variables.orgName) ?? demoOrganisations[0];
    return {
      promoteOrganisationMember: {
        success: true,
        errors: null,
        organisation: {
          members: organisation.members.filter(({ username }) => username !== variables.username),
        },
      },
    };
  }
  if (operationName === "DemoteOrganisationManager") {
    const organisation =
      demoOrganisations.find(({ name }) => name === variables.orgName) ?? demoOrganisations[0];
    return {
      demoteOrganisationManager: {
        success: true,
        errors: null,
        organisation: {
          managers: organisation.managers.filter(({ username }) => username !== variables.username),
        },
      },
    };
  }
  if (operationName === "RevokeToken") return { revokeToken: { success: true, errors: null } };

  return {};
};

export const demoApolloLink = new ApolloLink(
  (operation) =>
    new Observable((observer) => {
      const timeout = window.setTimeout(() => {
        observer.next({ data: responseFor(operation) });
        observer.complete();
      }, 120);

      return () => window.clearTimeout(timeout);
    }),
);
