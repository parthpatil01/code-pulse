# Extensive Guide to Code Refactoring

This document provides an extensive overview of code refactoring principles, techniques, and best practices. Refactoring is the process of restructuring existing computer code—changing the factoring—without changing its external behavior. It is intended to improve nonfunctional attributes of the software, such as readability, maintainability, and extensibility.

## Why Refactor?

* **Improve Code Design:** Over time, the design of code can degrade. Refactoring helps to bring it back to a well-structured state.
* **Easier to Understand:** Well-refactored code is clearer and easier for developers (including your future self) to understand.
* **Faster Development:** A clean and well-organized codebase makes it easier to add new features and fix bugs.
* **Improved Maintainability:** Refactored code is easier to modify and maintain over the long term.
* **Reduced Complexity:** Refactoring can break down complex code into smaller, more manageable pieces.
* **Enhanced Testability:** Clean code is generally easier to test.
* **Uncover Hidden Design Flaws:** The process of refactoring can reveal underlying design issues that were not apparent before.

## When Should You Refactor?

* **The Rule of Three:** The first time you do something, just do it. The second time you do something similar, you wince at the duplication, but you still do it. The third time you do something similar, you should refactor.
* **Preparatory Refactoring:** Before adding a new feature, refactor the existing code to make it easier to implement the new functionality. "Make the change easy, then make the easy change." - Kent Beck
* **When Fixing Bugs:** If the code is hard to understand or the bug fix is complex, refactoring the surrounding code can make the fix safer and easier.
* **During Code Reviews:** Code reviews can highlight areas that could benefit from refactoring.
* **When Code Smells:** Certain characteristics in code ("code smells") indicate potential problems and opportunities for refactoring.
* **Long Methods:** Methods that are too long are hard to understand.
* **Large Classes:** Classes that do too much become difficult to manage.
* **Duplicate Code:** Redundant code leads to maintenance nightmares.
* **Long Parameter Lists:** Make method calls hard to read and understand.
* **Divergent Change:** One class is commonly changed in different ways for different reasons.
* **Shotgun Surgery:** Every time you make a certain kind of change, you have to make many small changes in many different classes.
* **Feature Envy:** A method seems more interested in a class other than the one it actually is in.
* **Data Clumps:** Groups of variables that tend to hang around together.
* **Primitive Obsession:** Using primitive data types instead of small objects for simple concepts.
* **Switch Statements:** Often indicate a need for polymorphism.
* **Parallel Inheritance Hierarchies:** Every time you add a subclass to one hierarchy, you must also add a subclass to another.
* **Lazy Class:** A class that isn't doing very much.
* **Speculative Generality:** Code that's written "for the future" and isn't needed now.
* **Temporary Field:** An instance variable that is only set in certain circumstances.
* **Message Chains:** A client asks one object for another object, which it then asks for yet another object, and so on.
* **Middle Man:** A class whose only purpose is delegating to another class.
* **Inappropriate Intimacy:** One class has too much knowledge of the internal workings of another class.
* **Alternative Classes with Different Interfaces:** Doing the same thing with different method signatures.
* **Incomplete Library Class:** Not all the methods you need are in a library class.
* **Data Class:** A class that has fields, getting and setting methods, and nothing else.
* **Refused Bequest:** A subclass only uses some of the methods and data of its superclass.
* **Comments:** Can be necessary, but excessive comments might indicate poorly written code.

## Core Refactoring Techniques

This is a non-exhaustive list of common refactoring techniques:

### Composing Methods

* **Extract Method:** Turn a code fragment into a new method.
* **Inline Method:** Replace a method call with the method's body.
* **Extract Variable:** Introduce an explanatory variable.
* **Inline Temp:** Replace references to a temporary variable with the results of an expression.
* **Replace Temp with Query:** Replace a temporary variable with a method call.
* **Split Temporary Variable:** Introduce a separate temporary variable for each assignment to a variable.
* **Remove Assignments to Parameters:** Use a temporary variable instead of assigning to a parameter.
* **Replace Method with Method Object:** Turn a method that carries on a long computation into a separate class so that you can localize all the local variables.
* **Substitute Algorithm:** Replace the body of a method with a new algorithm.

### Moving Features Between Objects

* **Move Method:** Create a new method in the class or classes that use the method most. Either leave the old method or delete it.
* **Move Field:** Create a new field in the class or classes that use the field most. Either leave the old field or delete it.
* **Extract Class:** Create a new class and move related fields and methods from the old class into the new class.
* **Inline Class:** Move all the features of a class into another class. Delete the original class.
* **Hide Delegate:** Remove the middle man object.
* **Remove Middle Man:** Have the client call the delegate directly.
* **Introduce Foreign Method:** Create a method in a client class to provide a service needed by a server class but place the method in the client.
* **Introduce Local Extension:** Create a new class with the methods you need. Make this extension either a subclass or a wrapper of the original class.

### Organizing Data

* **Self Encapsulate Field:** Create getter and setter methods for a field.
* **Replace Data Value with Object:** Turn a data item into an object.
* **Change Value to Reference:** Turn a value object into a reference object.
* **Change Reference to Value:** Turn a reference object into a value object.
* **Replace Array with Object:** Replace an array with an object (to get a record-like structure with keys).
* **Duplicate Observed Data:** Separate domain data from GUI data. Store the data in a domain object that the GUI object observes.
* **Change Unidirectional Association to Bidirectional:** Add a back pointer in an associated class.
* **Change Bidirectional Association to Unidirectional:** Drop the back pointer in an associated class.
* **Replace Magic Number with Symbolic Constant:** Create a constant for a literal value.
* **Encapsulate Field:** Make a field `private` and provide accessors.
* **Encapsulate Collection:** Return a read-only view of a collection field, and provide methods for adding and removing elements.
* **Replace Record with Data Class:** Create a class for a simple record data structure.
* **Replace Type Code with Class:** Replace an enumeration with a class with behavior.
* **Replace Type Code with Subclasses:** Replace an enumeration with subclasses.
* **Replace Type Code with State/Strategy:** Replace an enumeration with a State object.
* **Replace Subclass with Fields:** Create fields in a superclass to hold values that otherwise would be obtained via subclasses.

### Simplifying Conditional Expressions

* **Decompose Conditional:** Replace a complex conditional (if-then-else) statement with calls to separate methods.
* **Consolidate Conditional Expression:** Replace a sequence of conditional checks with a single conditional expression and extract it.
* **Consolidate Duplicate Conditional Fragments:** Move code that is the same in all branches of a conditional to outside the conditional.
* **Remove Control Flag:** Use `break` or `return` in preference to a control flag.
* **Replace Nested Conditional with Guard Clauses:** Use guard clauses for all the special cases.
* **Replace Conditional with Polymorphism:** Create subclasses or use State pattern to handle varying behavior based on type or state.
* **Introduce Null Object:** Use a null object instead of null value checks.
* **Introduce Assertion:** Make assumptions about a program's state explicit with assertions.

### Simplifying Method Calls

* **Rename Method:** Change the name of a method.
* **Add Parameter:** Add a parameter to a method.
* **Remove Parameter:** Remove a parameter from a method.
* **Separate Query from Modifier:** Create two different methods for a method that returns a value and also changes the state of an object.
* **Parameterize Method:** Several methods do similar things but with different values; modify them to take this value as a parameter instead.
* **Replace Parameter with Explicit Methods:** Create a separate method for each value of a parameter.
* **Preserve Whole Object:** Instead of passing several data items from an object, pass the object itself.
* **Introduce Parameter Object:** Replace several parameters with an object.
* **Remove Setting Method:** For a field, don't provide a setting method if the field should be set only at creation.
* **Replace Constructor with Factory Method:** Replace a simple constructor with a factory method that can return subclasses based on type codes.
* **Replace Error Code with Exception:** Replace error codes with exceptions.
* **Replace Exception with Test:** Replace exception handling with a test.

### Dealing with Generalization

* **Pull Up Field:** Move a field to a superclass.
* **Pull Up Method:** Move a method to a superclass.
* **Pull Up Constructor Body:** Move the common parts of constructors in subclasses to a superclass constructor.
* **Push Down Method:** Move a method to a subclass.
* **Push Down Field:** Move a field to a subclass.
* **Extract Subclass:** Create a subclass for behavior that varies.
* **Extract Superclass:** Create a superclass for common behavior.
* **Extract Interface:** Create an interface to extract common behavior.
* **Collapse Hierarchy:** Merge a superclass and subclass.
* **Form Template Method:** Define the skeleton of an algorithm in an operation, deferring some steps to subclasses.
* **Replace Inheritance with Delegation:** Create a field in the superclass to hold a delegate object and implement the subclass methods by delegating to the delegate.
* **Replace Delegation with Inheritance:** Make the delegate the parent of the class.

## Best Practices for Refactoring

* **Refactor in Small Steps:** Make small, incremental changes and test after each step. This reduces the risk of introducing bugs and makes it easier to track down problems.
* **Test Frequently:** Ensure you have good unit tests in place before you start refactoring. Run these tests after each small refactoring step to verify that you haven't broken any existing functionality.
* **Don't Refactor and Add Functionality Simultaneously:** Keep these two activities separate to avoid confusion and make it easier to isolate the cause of any issues.
* **Collaborate with Your Team:** Discuss refactoring plans with your team to ensure everyone is on the same page and to get different perspectives.
* **Use Automated Refactoring Tools:** IDEs often provide built-in refactoring tools that can automate many common refactorings safely and efficiently.
* **Don't Refactor Just for the Sake of It:** Refactor when there is a clear benefit, such as improved readability, maintainability, or when it makes adding new features easier.
* **Be Prepared to Revert:** If a refactoring goes wrong, be prepared to revert to the last working version. Version control systems like Git are invaluable for this.
* **Communicate Refactoring Efforts:** Let your team and stakeholders know about significant refactoring efforts, especially if they might impact timelines.
* **Measure the Impact:** Where possible, try to measure the impact of refactoring on code quality metrics, development speed, or bug rates.

## Conclusion

Refactoring is an essential practice in software development. By continuously improving the structure and clarity of our code, we can create more maintainable, understandable, and robust software. While it requires time and effort, the long-term benefits of a well-refactored codebase far outweigh the costs. Remember to refactor in small, well-tested steps and to focus on the specific goals of each refactoring effort.