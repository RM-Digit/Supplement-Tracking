import React from "react";
import {
  FormLayout,
  TextField,
  Button,
  DatePicker,
  Heading,
} from "@shopify/polaris";

export default function AddCustomer({ getCustomer }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [track, setTrack] = React.useState(0);
  const [createdAt, setCreatedDate] = React.useState("");
  const [showPicker, SetShowPicker] = React.useState(false);

  const [{ month, year }, setDate] = React.useState({ month: 2, year: 2022 });
  const [selectedDates, setSelectedDates] = React.useState({
    start: new Date("Wed Feb 07 2018 00:00:00 GMT-0500 (EST)"),
    end: new Date("Wed Feb 07 2018 00:00:00 GMT-0500 (EST)"),
  });

  const handleMonthChange = React.useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const handleDatePick = React.useCallback((value) => {
    console.log("val", value);
    setSelectedDates(value);
    setCreatedDate(value.start.toLocaleDateString());
  }, []);

  const createObj = (name, email, track, createdAt) => ({
    name,
    email,
    track,
    createdAt,
  });
  const handleClick = () => {
    getCustomer(createObj(name, email, track, createdAt));
  };

  const handleBlur = () => {
    SetShowPicker(false);
  };

  return (
    <FormLayout>
      <FormLayout.Group condensed>
        <TextField
          label="Customer Name"
          value={name}
          onChange={setName}
          autoComplete="off"
        />
        <TextField
          label="Customer Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <TextField
          label="Track"
          type="number"
          value={track}
          min={0}
          onChange={setTrack}
          autoComplete="off"
        />
        <Heading>
          <TextField
            label="Date"
            value={createdAt}
            // onBlur={handleBlur}
            autoComplete="off"
            onFocus={() => SetShowPicker(true)}
          />

          {showPicker && (
            <DatePicker
              month={month}
              year={year}
              onChange={handleDatePick}
              onMonthChange={handleMonthChange}
              selected={selectedDates}
            />
          )}
        </Heading>

        <Button primary onClick={handleClick}>
          Submit
        </Button>
      </FormLayout.Group>
    </FormLayout>
  );
}
