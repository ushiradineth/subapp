import React from "react";
import { render, screen } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";

import InfoCard from "../../src/components/Atoms/InfoCard";
import config from "../../tamagui.config";

describe("InfoCard", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TamaguiProvider config={config}>
        <InfoCard>Testing Children</InfoCard>
      </TamaguiProvider>,
    );

    expect(getByText("Testing Children")).toBeTruthy();

    expect(screen.toJSON()).toMatchSnapshot();
  });
});
