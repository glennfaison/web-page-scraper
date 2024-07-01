import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";


describe("App", () => {
  it("renders the App component", () => {
    render(<App />);
    expect(screen.getByText(/enter the url/i)).toBeInTheDocument();
  });

  it("updates the URL input field", () => {
    render(<App />);
    const inputElement = screen.getByRole("textbox");
    fireEvent.change(inputElement, {
      target: { value: "https://www.example.com" },
    });
    expect(inputElement.value).toBe("https://www.example.com");
  });

  it("disables the Run button when isRunning is true", () => {
    render(<App />);
    const runButton = screen.getByRole("button", { name: "Run" });
    expect(runButton).toBeEnabled();
    fireEvent.click(runButton);
    expect(runButton).toBeDisabled(); // Assert that the button is now disabled
  });

  
  it("shows the spinner when isRunning is true", () => {
    render(<App />);
    const runButton = screen.getByRole("button", { name: "Run" });
    expect(runButton).toBeEnabled();
    fireEvent.click(runButton);
    expect(screen.getByRole("status", { label: "Loading" })).toBeVisible();
  });
});
