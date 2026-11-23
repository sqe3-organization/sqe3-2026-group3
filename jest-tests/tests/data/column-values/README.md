# Datasets of column values

| File | Origin | Used by |
|---|---|---|
| `negative-cases.json` | TC-COLVAL-009 to 016 from Lab 3, moved out of the test code | negative.test.js |
| `invalid-values.json` | GenAI, then checked against monday.com | negative.test.js |
| `text-values.json` | GenAI, then checked against monday.com | boundary.test.js |
| `dates.csv` | GenAI, then checked against monday.com | boundary.test.js |

Fields: `id`, `title`, the data of the case and the expected result.
A row with `knownBug` runs with `test.failing` (see `tests/support/data-driven.js`).

## Prompt used to generate the datasets

Tool: a GenAI chat assistant (LLM).

```
I test the monday.com GraphQL API (version 2025-04), mutation change_multiple_column_values.
The test board has 3 columns: status (id "status", labels 0 Working on it, 1 Done, 2 Stuck),
date (id "date4") and text (id "text"). Before each test a new item is created with
status "Working on it", date 2026-11-01 and text "Initial text".
I already have these negative cases: malformed JSON, column id that does not exist, status label
that does not exist, valid column together with a wrong column, status index 99, date 15/11/2026,
item id and board id that do not exist.

Generate datasets for data driven tests in Jest (test.each) that cover variations and critical
cases that a person can miss:
1. text-values.json: 13 values for the text column (accents, emoji, other alphabets, quotes,
   backslashes, HTML, SQL, line break, spaces, long text, empty). Fields: id, title, value and
   expected only when the saved text should be different.
2. dates.csv: 15 dates for the date column with the columns id,title,date,time,valid (yes/no).
   Include leap years, the end of the months, wrong months and days, formats without zeros,
   limits of the year and times.
3. invalid-values.json: 12 negative cases that are not in my list. Fields: id, title, values
   (the raw JSON string for column_values) and error { code and/or message }.
Do not repeat my cases. Answer only with the files.

Format of your answer: three fenced code blocks, each preceded by a line with the file name.
For the long text use a field "repeat" (number of times the value is repeated) instead of
writing it out. Use ids TXT-01.., DATE-01.., NEG-01..
```

## Procedure

1. I wrote the context of the board and the cases we already had, so the AI did not repeat them.
2. The AI gave the 3 files. I checked the format and the ids.
3. I ran every row against monday.com and compared the expected result with the real one.
4. When monday.com was right and the AI was wrong, I changed the expected value (for example monday.com
   accepts some values that the AI thought were invalid).
5. When the result looks like a defect, the row keeps the correct expected value and gets `knownBug`.
