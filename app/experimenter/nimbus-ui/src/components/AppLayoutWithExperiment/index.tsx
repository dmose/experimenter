/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from "react";
import { RouteComponentProps, useParams } from "@reach/router";
import AppLayoutWithSidebar from "../AppLayoutWithSidebar";
import HeaderExperiment from "../HeaderExperiment";
import PageLoading from "../PageLoading";
import PageExperimentNotFound from "../PageExperimentNotFound";
import { useExperiment } from "../../hooks";
import { getExperiment_experimentBySlug } from "../../types/getExperiment";
import AppLayout from "../AppLayout";
import { NimbusExperimentStatus } from "../../types/globalTypes";

type AppLayoutWithExperimentChildrenProps = {
  experiment: getExperiment_experimentBySlug;
  review: {
    isMissingField: (fieldName: string) => boolean;
    refetch: () => void;
  };
};

type AppLayoutWithExperimentProps = {
  children: (
    props: AppLayoutWithExperimentChildrenProps,
  ) => React.ReactNode | null;
  testId: string;
  title: string;
  polling?: boolean;
  sidebar?: boolean;
} & RouteComponentProps;

export const POLL_INTERVAL = 30000;

const AppLayoutWithExperiment = ({
  children,
  testId,
  title,
  sidebar = true,
  polling = false,
}: AppLayoutWithExperimentProps) => {
  const { slug } = useParams();
  const {
    experiment,
    notFound,
    loading,
    startPolling,
    stopPolling,
    review,
  } = useExperiment(slug);

  useEffect(() => {
    if (polling && experiment) {
      startPolling(POLL_INTERVAL);
    }
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, experiment, polling]);

  if (loading) {
    return <PageLoading />;
  }

  if (notFound) {
    return <PageExperimentNotFound {...{ slug }} />;
  }

  const { name, status } = experiment;

  return (
    <Layout {...{ sidebar, children, review }} status={experiment.status}>
      <section data-testid={testId}>
        <HeaderExperiment
          {...{
            slug,
            name,
            status,
          }}
        />
        <h2 className="mt-3 mb-4 h4" data-testid="page-title">
          {title}
        </h2>
        {children({ experiment, review })}
      </section>
    </Layout>
  );
};

type LayoutProps = {
  sidebar: boolean;
  children: React.ReactElement;
  status: NimbusExperimentStatus | null;
  review: {
    ready: boolean;
    invalidPages: string[];
  };
};

const Layout = ({ sidebar, children, review, status }: LayoutProps) =>
  sidebar ? (
    <AppLayoutWithSidebar {...{ status, review }}>
      {children}
    </AppLayoutWithSidebar>
  ) : (
    <AppLayout>{children}</AppLayout>
  );

export default AppLayoutWithExperiment;
