# HtmlCleanCompress

Simple tool to clean and compress HTML files.

## What does HtmlCleanCompress

HtmlCleanCompress replace EOL (for Window, Linux or Mac format) and tabs with a white space.

HtmlCleanCompress removes HTML comments in the files ( comment starting with "&lt;--" and ending with "--&gt;)

HtmlCleanCompress removes duplicate white spaces.

## What doesn't HtmlCleanCompress

HtmlCleanCompress is not an HTML parser. If you have errors in your html, the errors remains.

HtmlCleanCompress do nothing in the embedded styles and javascript.

## How to use

From the node command line run:
```
node ./src/index.js --src=PathToTheHtmlSourceFiles --dest=PathToTheCleanedHtmlFiles
```

where PathToTheHtmlSourceFiles is a path to the html source files and PathToTheCleanedHtmlFiles is the path
to the folder where the cleaned files are pushed.
Warning: PathToTheCleanedHtmlFiles must exists and all the files in the folder are deleted.
