// Regression for React 18's partially filled 2048-byte UTF-8 stream buffer.
// https://github.com/facebook/react/issues/31134
// https://github.com/facebook/react/pull/26228
const React = require("react");
const { renderToPipeableStream } = require("react-dom/server");
const { PassThrough } = require("node:stream");
const { text } = require("node:stream/consumers");
const value = "Грабитель — связанные материалы 🐾 ".repeat(5);
const nodes = Array.from({ length: 120 }, (_, i) =>
  React.createElement("h2", { id: "связанные-материалы-" + i, key: i }, value)
);
const expected =
  "<main>" +
  Array.from(
    { length: 120 },
    (_, i) => '<h2 id="связанные-материалы-' + i + '">' + value + "</h2>"
  ).join("") +
  "</main>";
const stream = new PassThrough();
const { pipe } = renderToPipeableStream(
  React.createElement("main", null, nodes),
  {
    onAllReady() {
      pipe(stream);
    },
    onError(error) {
      console.error(error);
      process.exitCode = 1;
    },
  }
);
text(stream).then((result) => {
  console.log(
    JSON.stringify({
      zeroBytes: (result.match(/\0/g) || []).length,
      exact: result === expected,
    })
  );
  if (result !== expected) process.exitCode = 1;
});
