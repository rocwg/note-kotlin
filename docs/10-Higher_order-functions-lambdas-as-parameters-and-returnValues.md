# 10 Higher-order functions: lambdas as parameters and return values

::: tip This chapter covers

1. Function types
2. Higher-order functions and their use for structuring code
3. Inline functions
4. Non-local returns and labels
5. Anonymous functions

:::

You were introduced to lambdas in 5, where we explored the general concept, and dove deeper into the standard library functions that use lambdas in 6. Lambdas are a great tool for building abstractions, and of course their power isn’t restricted to collections and other classes in the standard library. In this chapter, you’ll learn how to create higher-order functions—your own functions that take lambdas as arguments or return them. You’ll see how higher-order functions can help simplify your code, remove code duplication, and build nice abstractions. You’ll also become acquainted with inline functions—a powerful Kotlin feature that removes the performance overhead associated with using lambdas and enables more flexible control flow within lambdas.

## 10.1 Declaring functions that return or receive other functions: higher-order functions

The key new idea of this chapter is the concept of higher-order functions. By definition, a higher-order function is a function that takes another function as an argument or returns one. In Kotlin, functions can be represented as values either by using lambdas or via function references. Therefore, a higher-order function is any function to which you can pass a lambda or a function reference as an argument, or a function which returns one, or both. For example, the filter standard library function takes a predicate function as an argument and is therefore a higher-order function:

```kotlin
list.filter { x > 0 }
```

In 6, you saw many other higher-order functions declared in the Kotlin standard library: map, with, and so on. Now you’ll learn how you can declare such functions in your own code. To do this, you must first be introduced to function types.

### 10.1.1 Function types specify the parameter types and return values of a lambda

In order to declare a function that takes a lambda as an argument, you need to know how to declare the type of the corresponding parameter. Before we get to this, let’s look at a simpler case and store a lambda in a local variable. You already saw how you can do this without declaring the type, relying on Kotlin’s type inference:

```kotlin
val sum = { x: Int, y: Int -> x + y }
val action = { println(42) }
```

In this case, the compiler infers that both the sum and action variables have function types.

Figure 10.1. Optional inlay hints in IntelliJ IDEA and Android Studio help visualize the inferred function types of lambdas like sum and action.



Now let’s see what an explicit type declaration for these variables looks like:

```kotlin
val sum: (Int, Int) -> Int = { x, y -> x + y }
val action: () -> Unit = { println(42) }
```

To declare a function type, you put the function parameter types in parentheses, followed by an arrow and the return type of the function (see 10.2).

Figure 10.2. Function-type syntax in Kotlin



As you remember from 8.1.6, the `Unit` type is used to specify that a function returns no meaningful value. The `Unit` return type can be omitted when you declare a regular function, but a function type declaration always requires an explicit return type, so you can’t omit `Unit` in this context.

Note how you can omit the types of the parameters `x, y` in the lambda expression `{ x, y -> x + y }`. Because they’re specified in the function type as part of the variable declaration, you don’t need to repeat them in the lambda itself.

Just like with any other function, the return type of a function type can be marked as nullable:

```kotlin
var canReturnNull: (Int, Int) -> Int? = { null }
```

You can also define a nullable variable of a function type. To specify that the variable itself, rather than the return type of the function, is nullable, you need to enclose the entire function type definition in parentheses and put the question mark after the parentheses:

```kotlin
var funOrNull: ((Int, Int) -> Int)? = null
```

Note the subtle difference between this example and the previous one. If you omit the parentheses, you’ll declare a function type with a nullable return type, and not a nullable variable of a function type. 10.3 illustrates this.

Figure 10.3. The parentheses decide whether a function type has a nullable return type, or is nullable itself.



### 10.1.2 Calling functions passed as arguments

Now that you know how to specify a functional type in Kotlin in a local variable, let’s discuss how to implement a higher-order function. The first example is as simple as possible and uses the same type declaration as the `sum` lambda you saw earlier. The function performs an arbitrary operation on two numbers, 2 and 3, and prints the result.

Listing 10.1. Defining a simple higher-order function

```kotlin
fun twoAndThree(operation: (Int, Int) -> Int) {
    val result = operation(2, 3)
    println("The result is $result")
}

fun main() {
    twoAndThree { a, b -> a + b }
    // The result is 5
    twoAndThree { a, b -> a * b }
    // The result is 6
}
```

The syntax for calling the function passed as an argument is the same as calling a regular function: you put the parentheses after the function name, and you put the parameters inside the parentheses.

::: info **Parameter names of function types**

You can specify names for parameters of a function type:

```kotlin
fun twoAndThree(
    operation: (operandA: Int, operandB: Int) -> Int
) {
    val result = operation(2, 3)
    println("The result is $result")
}

fun main() {
    twoAndThree { operandA, operandB -> operandA + operandB }
    // The result is 5
    twoAndThree { alpha, beta -> alpha + beta }
    // The result is 5
}
```

Parameter names don’t affect type matching. When you declare a lambda, you don’t have to use the same parameter names as the ones used in the function type declaration. But the names improve readability of the code and can be used in the IDE for code completion.

:::

As a more interesting example, let’s reimplement one of the most commonly used standard library functions: the filter function. You’ve used filter earlier, in 6.1.1, but now it’s time to engage with its inner workings. To keep things simple, you’ll implement the filter function on String, but the generic version that works on a collection of any elements is similar. The declaration of the filter function is shown in 10.4.

Figure 10.4. Declaration of the filter function, taking a predicate as a parameter



The filter function takes a predicate as a parameter. The type of predicate is a function that takes a character parameter and returns a Boolean result.When predicate returns true for given character, it needs to be present in the resulting string.If it returns false, it should not be included. Here’s how the function can be implemented.

The filter function implementation is straightforward. It checks whether each character satisfies the predicate. For those characters that do, it uses the append function of the StringBuilder provided by buildString (as you have gotten to know it in 5.4.2), gradually building up the result, and then returning it. This is particularly simple because of the iterator convention that you’ve seen previously in 9.3.4, allowing you to iterate over the String just like any other Kotlin collection.

Because both the extension function and the buildString function define a receiver, you use a labeled this expression to access the outer receiver of the filter function (the input string) rather than the receiver of the buildString lambda (a StringBuilder instance).You’ll take a closer look at the labeled this expression in 10.6.

Listing 10.2. Implementing a simple version of the filter function

```kotlin
fun String.filter(predicate: (Char) -> Boolean): String {
    return buildString {
        for (char in this@filter) {
            if (predicate(char)) append(char)
        }
    }
}

fun main() {
    println("ab1c".filter { it in 'a'..'z' })
    // abc
}
```

::: warning IntelliJ IDEA tip

IntelliJ IDEA supports smart stepping into lambda code in the debugger. If you step through the previous example, you’ll see how execution moves between the body of the `filter` function and the lambda you pass through it, as the function processes each element in the input list.

:::

### 10.1.3 Java lambdas are automatically converted to Kotlin function types

As you already discovered in 5.2.1, you can pass a Kotlin lambda to any Java method that expects a functional interface through automatic **SAM** (single abstract method) conversion. This means that your Kotlin code can rely on Java libraries and call higher-order functions defined in Java without problem. Likewise, Kotlin functions that use function types can be called easily from Java. Java lambdas are automatically converted to values of function types:

Listing 10.3. ProcessTheAnswer.kt

```kotlin
/* Kotlin declaration */
fun processTheAnswer(f: (Int) -> Int) {
    println(f(42))
}
```

```kotlin
/* Java call */
processTheAnswer(number -> number + 1);
// 43
```

In Java, you can easily use extension functions from the Kotlin standard library that expect lambdas as arguments. Note, however, that they don’t look as nice as in Kotlin—you have to pass a receiver object as a first argument explicitly:

```kotlin
/* Java */
import kotlin.collections.CollectionsKt;

// ...
public static void main(String[] args) {
    List<String> strings = new ArrayList();
    strings.add("42");
    CollectionsKt.forEach(strings, s -> {
       System.out.println(s);
       return Unit.INSTANCE;
    });
}
```

In Java, your function or lambda can return `Unit`. But because the `Unit` type has a value in Kotlin, you need to return it explicitly. You can’t pass a lambda returning `void` as an argument of a function type that returns `Unit`, like `(String) → Unit` in the previous example.

::: info **Function types: implementation details**

On the JVM, Kotlin function types are declared as regular interfaces: a variable of a function type is an implementation of a `FunctionN` interface. The Kotlin standard library defines a series of interfaces, corresponding to different numbers of function arguments: `Function0<R>` (this function takes no arguments, and only specifies its return type), `Function1<P1, R>` (this function takes one argument), and so on. Each interface defines a single `invoke` method, and calling it will execute the function. A variable of a function type is an instance of a class implementing the corresponding `FunctionN` interface, with the `invoke` method containing the body of the lambda. Under the hood, that means 10.3 looks approximately like this:

```kotlin
fun processTheAnswer(f: Function1<Int, Int>) {
    println(f.invoke(42))
}
```

:::

### 10.1.4 Parameters with function types can provide defaults or be nullable

When you declare a parameter of a function type, you can also specify its default value. To see where this can be useful, let’s go back to the joinToString function that we discussed in 3.2. Here’s the implementation we ended up with.

Listing 10.4. joinToString with hard-coded toString conversion

```kotlin
fun <T> Collection<T>.joinToString(
        separator: String = ", ",
        prefix: String = "",
        postfix: String = ""
): String {
    val result = StringBuilder(prefix)

    for ((index, element) in this.withIndex()) {
        if (index > 0) result.append(separator)
        result.append(element)
    }

    result.append(postfix)
    return result.toString()
}
```

This implementation is flexible, but it doesn’t let you control one key aspect of the conversion: how individual values in the collection are converted to strings. The code uses `StringBuilder.append(o: Any?)`, which always converts the object to a string using the `toString` method. This is good in a lot of cases, but not always. You now know that you can pass a lambda to specify how values are converted into strings. But requiring all callers to pass that lambda would be cumbersome, because most of them are OK with the default behavior. To solve this, you can define a parameter of a function type and specify a default value for it as a lambda.

Listing 10.5. Specifying a default value for a parameter of a function type

```kotlin
fun <T> Collection<T>.joinToString(
        separator: String = ", ",
        prefix: String = "",
        postfix: String = "",
        transform: (T) -> String = { it.toString() }
): String {
    val result = StringBuilder(prefix)

    for ((index, element) in this.withIndex()) {
        if (index > 0) result.append(separator)
        result.append(transform(element))
    }

    result.append(postfix)
    return result.toString()
}

fun main() {
    val letters = listOf("Alpha", "Beta")
    println(letters.joinToString())
    // Alpha, Beta
    println(letters.joinToString { it.lowercase() })
    // alpha, beta
    println(letters.joinToString(separator = "! ", postfix = "! ",
           transform = { it.uppercase() }))
    // ALPHA! BETA!
}
```

Note that this function is generic: it has a type parameter T denoting the type of the element in a collection. The `transform` lambda will receive an argument of that type.

Declaring a default value of a function type requires no special syntax—you just put the value as a lambda after the `=` sign. The examples show different ways of calling the function: omitting the lambda entirely (so that the default `toString()` conversion is used), passing it outside of the parentheses (because it is the last argument of the `joinToString` function), and passing it as a named argument.

An alternative approach is to declare a parameter of a nullable function type. Note that you can’t call the function passed in such a parameter directly: Kotlin will refuse to compile such code, because it detects the possibility of null pointer exceptions in this case. One option is to check for null explicitly:

```kotlin
fun foo(callback: (() -> Unit)?) {
    // ...
    if (callback != null) {
        callback()
    }
}
```

A shorter version makes use of the fact that a function type is an implementation of an interface with an `invoke` method. As a regular method, `invoke` can be called through the safe-call syntax: `callback?.invoke()`.

Here’s how you can use this technique to rewrite the `joinToString` function.

Listing 10.6. Using a nullable parameter of a function type

```kotlin
fun <T> Collection<T>.joinToString(
        separator: String = ", ",
        prefix: String = "",
        postfix: String = "",
        transform: ((T) -> String)? = null
): String {
    val result = StringBuilder(prefix)
    for ((index, element) in this.withIndex()) {
        if (index > 0) result.append(separator)
        val str = transform?.invoke(element)
            ?: element.toString()
        result.append(str)
    }

    result.append(postfix)
    return result.toString()
}
```

This example is also a good time to remind yourself once more of the function type syntax discussed in 10.2: transform is a parameter of a nullable function type, but has a non-nullable return type: If transform is not null, it is guaranteed to return a non-null value of type `String.
Now you know how to write functions that take functions as arguments. Let’s look next at the other kind of higher-order functions: functions that return other functions.

### 10.1.5 Returning functions from functions

The requirement to return a function from another function doesn’t come up as often as passing functions to other functions, but it’s still useful. For instance, imagine a piece of logic in a program that can vary depending on the state of the program or other conditions—for example, calculating the cost of shipping depending on the selected shipping method. You can define a function that chooses the appropriate logic variant and returns it as another function. Here’s how this looks as code.

Listing 10.7. Defining a function that returns another function

```kotlin
enum class Delivery { STANDARD, EXPEDITED }

class Order(val itemCount: Int)

fun getShippingCostCalculator(delivery: Delivery): (Order) -> Double {
    if (delivery == Delivery.EXPEDITED) {
        return { order -> 6 + 2.1 * order.itemCount }
    }

    return { order -> 1.2 * order.itemCount }
}

fun main() {
    val calculator = getShippingCostCalculator(Delivery.EXPEDITED)
    println("Shipping costs ${calculator(Order(3))}")
    // Shipping costs 12.3
}
```

To declare a function that returns another function, you specify a function type as its return type. In 10.7, `getShippingCostCalculator` returns a function that takes an `Order` and returns a `Double`. To return a function, you write a `return` expression followed by a lambda, a member reference, or another expression of a function type, such as a local variable.

Let’s see another example where returning functions from functions is useful. Suppose you’re working on a GUI contact-management application, and you need to determine which contacts should be displayed, based on the state of the UI. Let’s say the UI allows you to type a string and then shows only contacts with names starting with that string; it also lets you hide contacts that don’t have a phone number specified. You’ll use the `ContactListFilters` class to store the state of the options.

```kotlin
class ContactListFilters {
    var prefix: String = ""
    var onlyWithPhoneNumber: Boolean = false
}
```

When a user types D to see the contacts whose first or last name starts with D, the prefix value is updated. We’ve omitted the code that makes the necessary changes. (A full UI application would be too much code for the book, so we show a simplified example.)

To decouple the contact-list display logic from the filtering UI, you can define a function that creates a predicate used to filter the contact list. This predicate checks the prefix and also checks that the phone number is present if required.

Listing 10.8. Using functions that return functions in UI code

```kotlin
data class Person(
        val firstName: String,
        val lastName: String,
        val phoneNumber: String?
)

class ContactListFilters {
    var prefix: String = ""
    var onlyWithPhoneNumber: Boolean = false

    fun getPredicate(): (Person) -> Boolean {
        val startsWithPrefix = { p: Person ->
            p.firstName.startsWith(prefix) || p.lastName.startsWith(prefix)
        }
        if (!onlyWithPhoneNumber) {
            return startsWithPrefix
        }
        return { startsWithPrefix(it)
                    && it.phoneNumber != null }
    }
}

fun main() {
    val contacts = listOf(
        Person("Dmitry", "Jemerov", "123-4567"),
        Person("Svetlana", "Isakova", null)
    )
    val contactListFilters = ContactListFilters()
    with (contactListFilters) {
        prefix = "Dm"
        onlyWithPhoneNumber = true
    }
    println(
        contacts.filter(contactListFilters.getPredicate())
    )
    // [Person(firstName=Dmitry, lastName=Jemerov, phoneNumber=123-4567)]
}
```

The `getPredicate` method returns a function value that you pass to the `filter` function as an argument. Kotlin function types allow you to do this just as easily as for values of other types, such as strings.

Higher-order functions give you an extremely powerful tool for improving the structure of your code and removing duplication. Let’s see how lambdas can help extract repeated logic from your code.

### 10.1.6 Making code more reusable by reducing duplication with lambdas

Function types and lambda expressions together constitute a great tool to create reusable code. Many kinds of code duplication that previously could be avoided only through cumbersome constructions can now be eliminated by using succinct lambda expressions.

Let’s look at an example that analyzes visits to a website. The class `SiteVisit` stores the path of each visit, its duration, and the user’s OS. Various OSs are represented with an enum.

Listing 10.9. Defining the site visit data

```kotlin
data class SiteVisit(
    val path: String,
    val duration: Double,
    val os: OS
)

enum class OS { WINDOWS, LINUX, MAC, IOS, ANDROID }

val log = listOf(
    SiteVisit("/", 34.0, OS.WINDOWS),
    SiteVisit("/", 22.0, OS.MAC),
    SiteVisit("/login", 12.0, OS.WINDOWS),
    SiteVisit("/signup", 8.0, OS.IOS),
    SiteVisit("/", 16.3, OS.ANDROID)
)
```

Imagine that you need to display the average duration of visits from Windows machines. You can perform the task using the average function.

Listing 10.10. Analyzing site visit data with hard-coded filters

```kotlin
val averageWindowsDuration = log
    .filter { it.os == OS.WINDOWS }
    .map(SiteVisit::duration)
    .average()

fun main() {
    println(averageWindowsDuration)
    // 23.0
}
```

Now, suppose you need to calculate the same statistics for Mac users. To avoid duplication, you can extract the platform as a parameter.

Listing 10.11. Removing duplication with a regular function

```kotlin
fun List<SiteVisit>.averageDurationFor(os: OS) =
        filter { it.os == os }.map(SiteVisit::duration).average()

fun main() {
    println(log.averageDurationFor(OS.WINDOWS))
    // 23.0
    println(log.averageDurationFor(OS.MAC))
    // 22.0
}
```

Note how making this function an extension improves readability. You can even declare this function as a local extension function if it makes sense only in the local context.

But it’s not powerful enough. Imagine that you’re interested in the average duration of visits from the mobile platforms (currently you recognize two of them: iOS and Android).

Listing 10.12. Analyzing site visit data with a complex hard-coded filter

```kotlin
fun main() {
    val averageMobileDuration = log
        .filter { it.os in setOf(OS.IOS, OS.ANDROID) }
        .map(SiteVisit::duration)
        .average()
    println(averageMobileDuration)
    // 12.15
}
```

Now a simple parameter representing the platform doesn’t do the job. It’s also likely that you’ll want to query the log with more complex conditions, such as "What’s the average duration of visits to the signup page from iOS?" Lambdas can help. You can use function types to extract the required condition into a parameter.

Listing 10.13. Removing duplication with a higher-order function

```kotlin
fun List<SiteVisit>.averageDurationFor(predicate: (SiteVisit) -> Boolean) =
        filter(predicate).map(SiteVisit::duration).average()

fun main() {
    println(
        log.averageDurationFor {
            it.os in setOf(OS.ANDROID, OS.IOS)
        }
    )
    // 12.15
    println(
        log.averageDurationFor {
            it.os == OS.IOS && it.path == "/signup"
        }
    )
    // 8.0
}
```

Function types can help eliminate code duplication. If you’re tempted to copy and paste a piece of the code, it’s likely that the duplication can be avoided. With lambdas, you can extract not only the data that’s repeated, but the behavior as well.

::: info Note

Some well-known design patterns can be simplified using function types and lambda expressions. Let’s consider the Strategy pattern, for example. Without lambda expressions, it requires you to declare an interface with several implementations for each possible strategy. With function types in your language, you can use a general function type to describe the strategy, and pass different lambda expressions as different strategies.

:::

We’ve discussed how to create higher-order functions. Next, let’s look at their performance. Won’t your code be slower if you begin using higher-order functions for everything, instead of writing good-old loops and conditions? The next section discusses why this isn’t always the case and how the `inline` keyword helps.

## 10.2 Removing the overhead of lambdas with inline functions

You’ve probably noticed that the shorthand syntax for passing a lambda as an argument to a function in Kotlin looks similar to the syntax of regular statements such as if and for. You saw this during our discussion of the with function in 5.4.1 and the apply function in 5.4.2. But what about performance? Aren’t we creating unpleasant surprises by defining functions that look exactly like Java statements but run much more slowly?

In 5.2.1, we explained that lambdas are normally compiled to anonymous classes. But that means every time you use a lambda expression, an extra class is created; and if the lambda captures some variables, then a new object is created on every invocation. This introduces runtime overhead, causing an implementation that uses a lambda to be less efficient than a function that executes the same code directly.

Could it be possible to tell the compiler to generate code that’s as efficient as directly executing the code, but still let you extract the repeated logic into a library function? Indeed, the Kotlin compiler allows you to do that. If you mark a function with the inline modifier, the compiler won’t generate a function call when this function is used and instead will replace every call to the function with the actual code implementing the function. Let’s explore how that works in detail and look at specific examples.

### 10.2.1 Inlining means substituting a function body to each call site

When you declare a function as inline, its body is inlined—in other words, it’s substituted directly into places where the function is called instead of being invoked normally. Let’s look at an example to understand the resulting code.

The function in listing 10.14 can be used to ensure that a shared resource isn’t accessed concurrently by multiple threads. The function locks a Lock object, executes the given block of code, and then releases the lock.

Listing 10.14. Defining an inline function

```kotlin
import java.util.concurrent.locks.Lock
import java.util.concurrent.locks.ReentrantLock

inline fun <T> synchronized(lock: Lock, action: () -> T): T {
    lock.lock()
    try {
        return action()
    }
    finally {
        lock.unlock()
    }
}

fun main() {
    val l = ReentrantLock()
    synchronized(l) {
        // ...
    }
}
```

The syntax for calling this function looks exactly like using the synchronized statement in Java. The difference is that the Java synchronized statement can be used with any object, whereas this function requires you to pass a Lock instance. The definition shown here is just an example; the Kotlin standard library also defines an implementation of synchronized, one that accepts any object as an argument.

But using explicit locks for synchronization provides for more reliable and maintainable code. In 10.2.5, we’ll introduce the `withLock` function from the Kotlin standard library, which you should prefer for executing the given action under a lock.

Because you’ve declared the `synchronized` function as `inline`, the code generated for every call to it is the same as for a `synchronized` statement in Java. Consider this example of using `synchronized()`:

```kotlin
fun foo(l: Lock) {
    println("Before sync")
    synchronized(l) {
        println("Action")
    }
    println("After sync")
}
```

10.5 shows the equivalent code, which will be compiled to the same

bytecode:

Figure 10.5. The compiled version of the foo function



Note that the inlining is applied to the lambda expression as well as the implementation of the synchronized function. The bytecode generated from the lambda becomes part of the definition of the calling function and isn’t wrapped in an anonymous class implementing a function interface.

Note that it’s also possible to call an inline function and pass the parameter of a function type from a variable:

```kotlin
class LockOwner(val lock: Lock) {
    fun runUnderLock(body: () -> Unit) {
        synchronized(lock, body)
    }
}
```

In this case, the lambda’s code isn’t available at the site where the inline function is called, and therefore it isn’t inlined. Only the body of the

synchronized function is inlined; the lambda is called as usual. The runUnderLock function will be compiled to bytecode similar to the following function:

```kotlin
class LockOwner(val lock: Lock) {
    fun __runUnderLock__(body: () -> Unit) {
        lock.lock()
        try {
            body()
        }
        finally {
            lock.unlock()
        }
    }
}
```

If you have two uses of an inline function in different locations with different lambdas, then every call site will be inlined independently. The code of the inline function will be copied to both locations where you use it, with different lambdas substituted into it.

Besides functions, you can also mark your property accessors (get, set) as inline. This becomes useful when making use of Kotlin’s reified generics. We’ll discuss examples and their details in chapter 11.

### 10.2.2 Restrictions on inline functions

Due to the way inlining is performed, not every function that uses lambdas can be inlined. When the function is inlined, the body of the lambda expression that’s passed as an argument is substituted directly into the resulting code. That restricts the possible uses of the corresponding parameter in the function body. If the lambda parameter is invoked, such code can be easily inlined. But if the parameter is stored somewhere for further use, the code of the lambda expression can’t be inlined, because there must be an object that contains this code:

```kotlin
class FunctionStorage {
    var myStoredFunction: ((Int) -> Unit)? = null
    inline fun storeFunction(f: (Int) -> Unit) {
        myStoredFunction = f
    }
}
```

Generally, the parameter can be inlined if it’s called directly or passed as an argument to another inline function. Otherwise, the compiler will prohibit the inlining of the parameter with an error message that says "Illegal usage of inline-parameter."

For example, various functions that work on sequences return instances of classes that represent the corresponding sequence operation and receive the lambda as a constructor parameter. Here’s how the Sequence.map function is defined:

```kotlin
fun <T, R> Sequence<T>.map(transform: (T) -> R): Sequence<R> {
    return TransformingSequence(this, transform)
}
```

The map function doesn’t call the function passed as the transform parameter directly. Instead, it passes this function to the constructor of a class that stores it in a property. To support that, the lambda passed as the transform argument needs to be compiled into the standard non-inline representation, as an anonymous class implementing a function interface.

If you have a function that expects two or more lambdas as arguments, you may choose to inline only some of them. This makes sense when one of the lambdas is expected to contain a lot of code or is used in a way that doesn’t allow inlining. You can mark the parameters that accept such non-inlineable lambdas with the `noinline` modifier:

```kotlin
inline fun foo(inlined: () -> Unit, noinline notInlined: () -> Unit) {
  // ...
}
```

Note that the compiler fully supports inlining functions across modules, or functions defined in third-party libraries. You can also call most inline functions from Java; such calls will not be inlined, but will be compiled as regular function calls.

Later in the book, in chapter 11, you’ll see another case where it makes sense to use noinline (with some constraints on Java interoperability, however).

### 10.2.3 Inlining collection operations

Let’s consider the performance of Kotlin standard library functions that work on collections. Most of the collection functions in the standard library take lambda expressions as arguments. Would it be more efficient to implement these operations directly, instead of using the standard library functions?

For example, let’s compare the ways you can filter a list of people, as shown in the next two listings.

Listing 10.15. Filtering a collection using a lambda

```kotlin
data class Person(val name: String, val age: Int)

val people = listOf(Person("Alice", 29), Person("Bob", 31))
```

```kotlin
fun main() {
    println(people.filter { it.age < 30 })
    // [Person(name=Alice, age=29)]
}
```

The previous code can be rewritten without lambda expressions, as shown next.

Listing 10.16. Filtering a collection manually

```kotlin
fun main() {
    val result = mutableListOf<Person>()
    for (person in people) {
          if (person.age < 30) result.add(person)
    }
    println(result)
    // [Person(name=Alice, age=29)]
}
```

In Kotlin, the filter function is declared as inline. It means the bytecode of the filter function, together with the bytecode of the lambda passed to it, will be inlined where filter is called. As a result, the bytecode generated for the first version that uses filter is roughly the same as the bytecode generated for the second version. You can safely use idiomatic operations on collections, and Kotlin’s support for inline functions ensures that you don’t

need to worry about performance.

Imagine now that you apply two operations, `filter` and `map`, in a chain.

```kotlin
fun main() {
    println(
        people.filter { it.age > 30 }
              .map(Person::name)
    )
    // [Bob]
}
```

This example uses a lambda expression and a member reference. Once again, both filter and map are declared as inline, so their bodies are inlined, and no extra classes or objects are created. But the code creates an intermediate collection to store the result of filtering the list. The code generated from the filter function adds elements to that collection, and the code generated from `map` reads from it.

If the number of elements to process is large, and the overhead of an intermediate collection becomes a concern, you can use a sequence instead, by adding an `asSequence` call to the chain. We previously discussed sequences in 6.2. But as you saw in the 10.2.2, lambdas used to process a sequence aren’t inlined. Each intermediate sequence is represented as an object storing a lambda in its field, and the terminal operation causes a chain of calls through each intermediate sequence to be performed. Therefore, even though operations on sequences are lazy, you shouldn’t strive to insert an `asSequence` call into every chain of collection operations in your code. This helps only for large collections; smaller ones can be processed nicely with regular collection operations.

### 10.2.4 Deciding when to declare functions as inline

Now that you’ve learned about the benefits of the inline keyword, you might want to start using inline throughout your codebase, trying to make it run faster. As it turns out, this isn’t a good idea. Using the inline keyword is likely to improve performance only with functions that take lambdas as arguments; all other cases require additional investigation, measuring, and profiling of your application.

For regular function calls, the JVM already provides powerful inlining support. It analyzes the execution of your code and inlines calls whenever doing so provides the most benefit. This happens automatically while translating bytecode to machine code. In bytecode, the implementation of each function is repeated only once and doesn’t need to be copied to every place where the function is called, as with Kotlin’s inline functions. What’s more, the stacktrace is clearer if the function is called directly.

On the other hand, inlining functions with lambda arguments is beneficial. First, the overhead you avoid through inlining is more significant. You save not only on the call, but also on the creation of the extra class for each lambda and an object for the lambda instance. Second, the JVM currently isn’t smart enough to always perform inlining through the call and the lambda. Finally, inlining lets you use features that are impossible to make work with regular lambdas, such as non-local returns, which we’ll discuss later in this chapter.

But you should still pay attention to the code size when deciding whether to use the inline modifier. If the function you want to inline is large, copying its bytecode into every call site could be expensive in terms of bytecode size. In that case, you should try to extract the code not related to the lambda arguments into a separate non-inline function. You can verify for yourself that the inline functions in the Kotlin standard library are always small.
Next, let’s see how higher-order functions can help you improve your code.

### 10.2.5 Using inlined lambdas for resource management with "withLock", "use", and "useLines"

One common pattern where lambdas can remove duplicate code is resource management: acquiring a resource before an operation and releasing it afterward. Resource here can mean many different things: a file, a lock, a database transaction, and so on. The standard way to implement such a pattern is to use a `try/finally` statement in which the resource is acquired before the `try` block and released in the `finally` block, or to use specialized language constructs like Java’s try-with-resources.

In 10.2.1, you saw an example of how you can encapsulate the logic of the `try/finally` statement in a function and pass the code using the resource as a lambda to that function. The example showed the `synchronized` function, which has the same syntax as the `synchronized` statement in Java: it takes the lock object as an argument. The Kotlin standard library defines another function called `withLock`, which has a more idiomatic API for the same task: it’s an extension function on the `Lock` interface. Here’s how it can be used:

```kotlin
val l: Lock = ReentrantLock()
l.withLock {
    // access the resource protected by this lock
}
```

Here’s how the withLock function is defined in the Kotlin library:

```kotlin
inline fun <T> Lock.withLock(action: () -> T): T {
    lock()
    try {
        return action()
    } finally {
        unlock()
    }
}
```

Files are another common type of resource where this pattern is used. 10.17 shows a Kotlin function that reads the first line from a file. To do so, it uses the use function from the Kotlin standard library. The use function is an extension function called on a closable resource (an object implementing the Closable interface); it receives a lambda as an argument. The function calls the lambda and ensures that the resource is closed, regardless of whether the lambda completes normally or throws an exception. In this example, it makes sure that the BufferedReader and FileReader, both of which implement Closeable, are properly closed down after use.

Listing 10.17. Using the use function for resource management

```kotlin
import java.io.BufferedReader
import java.io.FileReader

fun readFirstLineFromFile(fileName: String): String {
    BufferedReader(FileReader(fileName)).use { br ->
        return br.readLine()
    }
}
```

Of course, the use function is inlined, so its use doesn’t incur any performance overhead.

As in many other cases, the Kotlin standard library also comes with more specialized extension functions. While use is designed to work with any type of Closeable, the useLines function is defined for File and Path objects, and gives the lambda access to a sequence of strings (as you’ve gotten to know them in 6.2). This allows you to make the code more concise and idiomatic:

Listing 10.18. kotlin use lines

```kotlin
import kotlin.io.path.Path
import kotlin.io.path.useLines

fun readFirstLineFromFile(fileName: String): String {
    Path(fileName).useLines {
        return it.first()
    }
}
```

::: info **No try-with-resources in Kotlin**

Java has a special syntax for working with closable resources such as Files: the try-with-resources statement. The equivalent Java code to 10.17 to read the first line from a file would look like this:

```kotlin
/* Java */
static String readFirstLineFromFile(String fileName) throws IOException {
    try (BufferedReader br =
                   new BufferedReader(new FileReader(fileName))) {
        return br.readLine();
    }
}
```

Kotlin doesn’t have any equivalent special syntax, because the same task can be accomplished just as seamlessly via `use`. This once again illustrates nicely how versatile higher-order functions (functions expecting lambdas as arguments) can be.

:::

Note that in the body of the lambdas (both in 10.17 and 10.18), you use a non-local return to return a value from the `readFirstLineFromFile` function—you return from `readFirstLineFromFile` whose body contains the invocation of lambda, not just from the lambda itself. Let’s discuss the use of `return` expressions in lambdas in detail.

## 10.3 Returning from lambdas: Control flow in higher-order functions

When you start using lambdas to replace imperative code constructs such as loops, you quickly run into the issue of return expressions. Putting a return statement in the middle of a loop is a no-brainer. But what if you convert the loop into the use of a function such as filter? How does return work in that case? Let’s look at some examples.

### 10.3.1 Return statements in lambdas: returning from an enclosing function

We’ll compare two different ways of iterating over a collection. In the following listing, it’s clear that if the person’s name is Alice, you return from the function `lookForAlice`.

Listing 10.19. Using return in a regular loop

```kotlin
data class Person(val name: String, val age: Int)

val people = listOf(Person("Alice", 29), Person("Bob", 31))

fun lookForAlice(people: List<Person>) {
    for (person in people) {
        if (person.name == "Alice") {
            println("Found!")
            return
        }
    }
    println("Alice is not found")
}

fun main() {
    lookForAlice(people)
    // Found!
}
```

Is it safe to rewrite this code using forEach iteration? Will the return statement mean the same thing? Yes, it’s safe to use the forEach function instead, as shown next.

Listing 10.20. Using return in a lambda passed to forEach

```kotlin
fun lookForAlice(people: List<Person>) {
    people.forEach {
        if (it.name == "Alice") {
            println("Found!")
            return
        }
    }
    println("Alice is not found")
}
```

If you use the return keyword in a lambda, it returns from the function in which you called the lambda, not just from the lambda itself. Such a return statement is called a non-local return, because it returns from a larger block than the block containing the return statement.
To understand the logic behind the rule, think about using a return keyword in a for loop or a synchronized block in a Java method. It’s obvious that it returns from the function and not from the loop or block. Kotlin allows you to preserve the same behavior when you switch from language features to functions that take lambdas as arguments.

Note that the return from the outer function is possible only if the function that takes the lambda as an argument is inlined. In 10.20, the body of the forEach function is inlined together with the body of the lambda, so it’s easy to compile the return expression so that it returns from the enclosing function. Using the return expression in lambdas passed to non-inline functions isn’t allowed. That is because a non-inline function might store the lambda passed to it in a variable. That means it could execute the lambda later, when the function has already returned, so it’s too late for the lambda to

affect when the surrounding function returns.

### 10.3.2 Returning from lambdas: return with a label

You can write a local return from a lambda expression as well. A local return stops the execution of the lambda and continues execution of the code from which the lambda was invoked. To distinguish a local return from a non-local one, you use labels, which you’ve briefly seen in 2.4.1. You can label a lambda expression from which you want to return, and then refer to this label after the return keyword. In this example, you use forEach to iterate all elements in the input collection people, and use a labeled return to skip over elements where the name property is not "Alice":

Listing 10.21. Using a local return with a label

```kotlin
fun lookForAlice(people: List<Person>) {
    people.forEach label@{
        if (it.name != "Alice") return@label
        print("Found Alice!")
    }
}

fun main() {
    lookForAlice(people)
    // Found Alice!
}
```

To label a lambda expression, put the label name (which can be any identifier), followed by the @ character, before the opening curly brace of the lambda. To return from a lambda, put the @ character followed by the label name after the return keyword. This is illustrated in 10.6.

Figure 10.6. Returns from a lambda use the "@" character to mark a label.



Alternatively, the name of the function that takes this lambda as an argument can be used as a label.

Listing 10.22. Using the function name as a return label

```kotlin
fun lookForAlice(people: List<Person>) {
    people.forEach {
        if (it.name != "Alice") return@forEach
        print("Found Alice!")
    }
}
```

Note that if you specify the label of the lambda expression explicitly, labeling using the function name doesn’t work. A lambda expression can’t have more than one label.

::: info Labeled "this" expression

The same rules apply to the labels of this expressions. In 5.4, we discussed lambdas with receivers—lambdas that contain an implicit receiver object that can be accessed via a this reference in a lambda (Chapter 13 will explain how to write your own functions that expect lambdas with receivers as arguments). If you specify the label of a lambda with a receiver, you can access its implicit receiver using the corresponding labeled this expression:

```kotlin
fun main() {
    println(StringBuilder().apply sb@{
       listOf(1, 2, 3).apply {
           this@sb.append(this.toString())
       }
    })
    // [1, 2, 3]
}
```

As with labels for return expressions, you can specify the label of the lambda expression explicitly or use the function name instead.

:::

The non-local return syntax is fairly verbose and becomes cumbersome if a lambda contains multiple return expressions. As a solution, you can use an alternate syntax to pass around blocks of code: anonymous functions.

### 10.3.3 Anonymous functions: local returns by default

An anonymous function is another syntactic form of writing a lambda expression.As such, using anonymous functions is another way to write blocks of code that can be passed to other functions.However, they differ in the way you can use return expressions.Let’s take a closer look, and start with an example.

Listing 10.23. Using return in an anonymous function

```kotlin
fun lookForAlice(people: List<Person>) {
    people.forEach(fun (person) {
        if (person.name == "Alice") return
        println("${person.name} is not Alice")
    })
}

fun main() {
    lookForAlice(people)
    // Bob is not Alice
}
```

You can see that an anonymous function looks similar to a regular function, except that its name is omitted, and parameter types can be inferred. Here’s another example.

Listing 10.24. Using an anonymous function with filter

```kotlin
people.filter(fun (person): Boolean {
    return person.age < 30
})
```

Anonymous functions follow the same rules as regular functions for specifying the return type. Anonymous functions with a block body, such as the one in 10.24, require the return type to be specified explicitly. If you use an expression body, you can omit the return type.

Listing 10.25. Using an anonymous function with an expression body

```kotlin
people.filter(fun (person) = person.age < 30)
```

Inside an anonymous function, a return expression without a label returns from the anonymous function, not from the enclosing one. The rule is simple: return returns from the closest function declared using the fun keyword.
Lambda expressions don’t use the fun keyword, so a return in a lambda returns from the outer function. Anonymous functions do use fun; therefore, in the previous example, the anonymous function is the closest matching function. Consequently, the return expression returns from the anonymous function, not from the enclosing one. The difference is illustrated in figure 10.7.

Figure 10.7. The return expression returns from the function declared using the fun keyword.


Note that despite the fact that an anonymous function looks similar to a regular function declaration, it’s another syntactic form of a lambda expression.Generally, you will use the lambda syntax you have seen so far

throughout the book.Anonymous functions mainly help shortening code that has a lot of early return statements, that would have to be labeled when using the lambda syntax.

The discussion of how lambda expressions are implemented and how they’re inlined for inline functions applies to anonymous functions as well.

## 10.4 Summary

1. Function types allow you to declare a variable, parameter, or function return value that holds a reference to a function.
2. Higher-order functions take other functions as arguments or return them. You can create such functions by using a function type as the type of a function parameter or return value.
3. When an inline function is compiled, its bytecode along with the bytecode of a lambda passed to it is inserted directly into the code of the calling function, which ensures that the call happens with no overhead compared to similar code written directly.
4. Higher-order functions facilitate code reuse within the parts of a single component and let you build powerful generic and general-purpose libraries.
5. Inline functions allow you to use non-local returns—return expressions placed in a lambda that return from the enclosing function.
6. Anonymous functions provide an alternative syntax to lambda expressions with different rules for resolving the return expressions. You can use them if you need to write a block of code with multiple exit points.
