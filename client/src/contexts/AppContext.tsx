import { useEffect, createContext, ReactNode } from "react";
import { Store, useStore } from "store/store";
import { Email, Participant, User } from "interfaces/interfaces";
import { History, LocationState } from "history";
import { ApolloClient, ApolloError, useLazyQuery } from "@apollo/client";
import { GET_RECEIVED_EMAILS, GET_SENT_EMAILS } from "services/graphql";
import { useMediaQuery } from "@material-ui/core";

export type AppContextType = {
  apolloClient: ApolloClient<any> | undefined;
  emails: Email[];
  isSmallScreen: boolean;
  logout: () => void;
  handleErrors: (error: ApolloError) => void;
};

type HistoryType = History<LocationState>;

interface Props {
  children: ReactNode;
  history: HistoryType | {};
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children, history }: Props) => {
  const loggedInUser = useStore((state: Store) => state.loggedInUser);
  const setLoggedInUser = useStore((state: Store) => state.setLoggedInUser);
  const setSnackBarMessage = useStore((state: Store) => state.setSnackBarMessage);
  const clearSnackBarMessage = useStore((state: Store) => state.clearSnackBarMessage);
  const activeTab = useStore((state: Store) => state.activeTab);
  const isSmallScreen = useMediaQuery("(max-width:765px)");
  const emailsToFetch = activeTab === 0 ? GET_RECEIVED_EMAILS : GET_SENT_EMAILS;

  const [getEmails, { data, client: apolloClient }] = useLazyQuery(emailsToFetch, {
    variables: { loggedInUserEmail: (loggedInUser as User)?.email },
    onError: (error) => handleErrors(error),
    onCompleted: () => clearSnackBarMessage()
  });

  const emails = data?.getReceivedEmails || data?.getSentEmails;

  useEffect(() => {
    const user = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
    setLoggedInUser(user);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if ((loggedInUser as User)?.id) {
      getEmails();
    }
    // eslint-disable-next-line
  }, [loggedInUser]);

  useEffect(() => {
    if (emails) {
      const isReceivedEmails = emailsToFetch === GET_RECEIVED_EMAILS;

      emails.forEach((email: Email) => {
        const { sender, recipient } = email;

        // To do: try to store an array in localstorage
        if (isReceivedEmails) {
          localStorage[(sender as Participant).email] = sender?.fullName;
        } else {
          localStorage[(recipient as Participant).email] = recipient?.fullName;
        }
      });
    }
    // eslint-disable-next-line
  }, [emails]);

  const logout = () => {
    localStorage.clear();
    (history as HistoryType).push("/login");
  };

  const handleErrors = (error: any) => {
    const { message: gqlErrorMessage } = error;
    let content = null;

    const isGraphQLErrorsIncludesError = (gqlErrorMessage: string) => error.graphQLErrors?.[0]?.message?.includes(gqlErrorMessage);
    const isUserInputError = isGraphQLErrorsIncludesError("UserInputError");
    const isSequelizeValidationError = isGraphQLErrorsIncludesError("SequelizeValidationError");
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];

    if (gqlContextErrorMessage) {
      if (gqlContextErrorMessage === "Unauthenticated") {
        logout();
      }

      content = gqlContextErrorMessage;
    } else if (isUserInputError || isSequelizeValidationError) {
      content = error.graphQLErrors[0].message.split(": ")[isUserInputError ? 1 : 2];
    } else {
      content = gqlErrorMessage;
    };

    if (content) {
      setSnackBarMessage({ content, severity: "error" });
    }
  };

  return (
    <AppContext.Provider value={{ apolloClient, emails, isSmallScreen, logout, handleErrors }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };