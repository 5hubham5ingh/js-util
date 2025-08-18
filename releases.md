## **Release Notes: v1.14.0**

### **New Features** ✨

* **`String.prototype.wrap(maxLength: Number, byWord?: true): String`**: This new method wraps a string so that each line does not exceed a specified maximum length. The optional `byWord` parameter ensures that words are not broken across lines.

* **`String.prototype.chunks(size: Number): String[]`**: Returns an array of substrings, each with a length equal to the specified `size`.

* **`globalThis.enquire`**: A new global object for handling user input, providing a variety of useful functions:
    1.  **`enquire.ask(message: String): String`**: Asks the user a question and returns a single-line string response.
    2.  **`enquire.confirm(message: String): boolean`**: Prompts the user for a confirmation and returns a boolean value (`true` or `false`).
    3.  **`enquire.secret(message: String): String`**: Asks the user for input while masking the characters, suitable for passwords or other sensitive information.
    4.  **`enquire.choose(options: String[]): String`**: Allows the user to select one item from a list of options.
    5.  **`enquire.select(options: String[]): String[]`**: Allows the user to select multiple items from a list of options.
    6.  **`enquire.search(options: String[]): String`**: Provides a searchable interface for selecting one item from a list.
    7.  **`enquire.pick(): String`**: Opens a file or directory picker and returns the full path of the selected item.

---

### **Updates** ⬆️

* **`globalThis.ls`**: The `ls` function has been updated to return an array of string objects. Each object represents a file or directory and now includes the following properties for more detailed information:
    * **`isDir`**: A boolean indicating if the item is a directory.
    * **`isFile`**: A boolean indicating if the item is a file.
    * **`isLink`**: A boolean indicating if the item is a symbolic link.
    * **`size`**: The size of the file in bytes.
    * **`createdAt`**: The timestamp of when the file was created.
    * **`modifiedAt`**: The timestamp of the last time the file was modified.
