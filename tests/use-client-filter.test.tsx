import { describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { useClientFilter } from "../src/hooks/use-client-filter";

describe("useClientFilter", () => {
  // Test data
  type Item = {
    id: number;
    name: string;
    status: "active" | "completed" | "archived";
    priority: "low" | "medium" | "high";
  };

  const items: Item[] = [
    { id: 1, name: "Task 1", status: "active", priority: "high" },
    { id: 2, name: "Task 2", status: "completed", priority: "medium" },
    { id: 3, name: "Task 3", status: "active", priority: "low" },
    { id: 4, name: "Task 4", status: "archived", priority: "high" },
  ];

  // Example component using the hook
  function TestComponent() {
    const statusFilter = useClientFilter({
      name: "status-filter",
      defaultValue: undefined,
      enum: {
        all: undefined,
        active: "active",
        completed: "completed",
        archived: "archived",
      },
    });

    const priorityFilter = useClientFilter({
      name: "priority-filter",
      defaultValue: undefined,
      enum: {
        all: undefined,
        low: "low",
        medium: "medium",
        high: "high",
      },
    });

    const filteredItems = items
      // @ts-ignore
      .filter((item) => statusFilter.filterFn(item.status))
      // @ts-ignore
      .filter((item) => priorityFilter.filterFn(item.priority));

    return (
      <div>
        <div>
          <label htmlFor="status-select">Status:</label>
          <select
            id="status-select"
            data-testid="status-filter"
            value={statusFilter.value ?? ""}
            onChange={statusFilter.handleChange}
          >
            {statusFilter.options.map((option) => (
              <option key={option.name} value={option.value ?? ""}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority-select">Priority:</label>
          <select
            id="priority-select"
            data-testid="priority-filter"
            value={priorityFilter.value ?? ""}
            onChange={priorityFilter.handleChange}
          >
            {priorityFilter.options.map((option) => (
              <option key={option.name} value={option.value ?? ""}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <ul>
          {filteredItems.map((item) => (
            <li key={item.id} data-testid={`item-${item.id}`}>
              {item.name} - {item.status} ({item.priority})
            </li>
          ))}
        </ul>

        <div data-testid="results-count">Showing: {filteredItems.length}</div>
      </div>
    );
  }

  test("renders with default filters showing all items", () => {
    render(<TestComponent />, { wrapper: createWrapper() });

    expect(screen.getAllByTestId(/item-/)).toHaveLength(4);
    expect(screen.getByTestId("status-filter")).toHaveValue("");
    expect(screen.getByTestId("priority-filter")).toHaveValue("");

    cleanup();
  });

  test("filters by status", () => {
    render(<TestComponent />, { wrapper: createWrapper() });

    const statusFilter = screen.getByTestId("status-filter");
    fireEvent.change(statusFilter, { target: { value: "active" } });

    expect(screen.getAllByTestId(/item-/)).toHaveLength(2);
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-3")).toBeInTheDocument();

    cleanup();
  });

  test("filters by priority", () => {
    render(<TestComponent />, { wrapper: createWrapper() });

    const priorityFilter = screen.getByTestId("priority-filter");
    fireEvent.change(priorityFilter, { target: { value: "high" } });

    expect(screen.getAllByTestId(/item-/)).toHaveLength(2);
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-4")).toBeInTheDocument();

    cleanup();
  });

  test("combines multiple filters", () => {
    render(<TestComponent />, { wrapper: createWrapper() });

    const statusFilter = screen.getByTestId("status-filter");
    const priorityFilter = screen.getByTestId("priority-filter");

    fireEvent.change(statusFilter, { target: { value: "active" } });
    fireEvent.change(priorityFilter, { target: { value: "high" } });

    const filteredItems = screen.getAllByTestId(/item-/);
    expect(filteredItems).toHaveLength(1);
    expect(screen.getByTestId("item-1")).toBeInTheDocument();

    cleanup();
  });

  test("resets filter to show all items", () => {
    render(<TestComponent />, { wrapper: createWrapper() });

    const statusFilter = screen.getByTestId("status-filter");

    // Apply filter
    fireEvent.change(statusFilter, { target: { value: "active" } });
    expect(screen.getAllByTestId(/item-/)).toHaveLength(2);

    // Reset filter
    fireEvent.change(statusFilter, { target: { value: "" } });
    expect(screen.getAllByTestId(/item-/)).toHaveLength(4);

    cleanup();
  });

  test("maintains filters on rerender", () => {
    const { rerender } = render(<TestComponent />, {
      wrapper: createWrapper(),
    });

    const statusFilter = screen.getByTestId("status-filter");
    fireEvent.change(statusFilter, { target: { value: "active" } });

    rerender(<TestComponent />);

    expect(statusFilter).toHaveValue("active");
    expect(screen.getAllByTestId(/item-/)).toHaveLength(2);

    cleanup();
  });

  test("shows correct count with multiple filters", () => {
    render(<TestComponent />, { wrapper: createWrapper() });

    const statusFilter = screen.getByTestId("status-filter");
    const priorityFilter = screen.getByTestId("priority-filter");
    const resultsCount = screen.getByTestId("results-count");

    // Initial state
    expect(resultsCount).toHaveTextContent("Showing: 4");

    // Apply first filter
    fireEvent.change(statusFilter, { target: { value: "active" } });
    expect(resultsCount).toHaveTextContent("Showing: 2");

    // Apply second filter
    fireEvent.change(priorityFilter, { target: { value: "high" } });
    expect(resultsCount).toHaveTextContent("Showing: 1");

    cleanup();
  });

  test("handles custom filter function", () => {
    function TestWithCustomFilter() {
      const customFilter = useClientFilter({
        name: "custom-filter",
        defaultValue: undefined,
        enum: { all: undefined, highPriority: "high" },
        filterFn: (value) => value === "high",
      });

      const filteredItems = items.filter((item) =>
        // @ts-ignore
        customFilter.value ? customFilter.filterFn(item.priority) : true,
      );

      return (
        <ul>
          {filteredItems.map((item) => (
            <li key={item.id} data-testid={`item-${item.id}`}>
              {item.name}
            </li>
          ))}
        </ul>
      );
    }

    render(<TestWithCustomFilter />, { wrapper: createWrapper() });
    expect(screen.getAllByTestId(/item-/)).toHaveLength(4);

    cleanup();
  });
});

function createWrapper() {
  // @ts-ignore
  return ({ children }) => (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={children} />
      </Routes>
    </MemoryRouter>
  );
}
