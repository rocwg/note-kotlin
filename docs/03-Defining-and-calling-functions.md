3Defining and calling functions
This chapter covers

Functions for working with collections, strings, and regular expressions Using named arguments, default parameter values, and the infix call syntax
Adapting Java libraries to Kotlin through extension functions and properties
Structuring code with top-level and local functions and properties

By now, you should be fairly comfortable with using Kotlin on a basic level, the same way you might have used other object-oriented languages like Java before. You’ve seen how the concepts familiar to you from Java translate to Kotlin, and how Kotlin often makes them more concise and readable.

In this chapter, you’ll see how Kotlin improves on one of the key elements of every program: declaring and calling functions. We’ll also look into the possibilities for adapting Java libraries to the Kotlin style through the use of extension functions, allowing you to gain the full benefits of Kotlin in mixed- language projects.

To make our discussion more useful and less abstract, we’ll focus on Kotlin collections, strings, and regular expressions as our problem domain. As an introduction, let’s look at how to create collections in Kotlin.

3.1Creating collections in Kotlin
Before you can do interesting things with collections, you need to learn how to create them. In 2.3.4, you bumped into the way to create a new set: the setOf function. You created a set of colors then, but for now, let’s keep it simple and work with numbers:

val set = setOf(1, 7, 53)

You create a list or a map in a similar way:

val list = listOf(1, 7, 53)
val map = mapOf(1 to "one", 7 to "seven", 53 to "fifty-three")

Note that to isn’t a special construct, but a normal function. We’ll return to it later in the chapter, in 8.2.

Can you guess the classes of objects that are created here? Run the following example to see this for yourself:

fun main() {
println(set.javaClass) #1
// class java.util.LinkedHashSet

println(list.javaClass)
// class java.util.Arrays$ArrayList

println(map.javaClass)
// class java.util.LinkedHashMap
}

As you can see, Kotlin uses the standard Java collection classes. This is good news for Java developers: Kotlin doesn’t re-implement collection classes. All of your existing knowledge about Java collections still applies here. It is worth noting however that unlike in Java, Kotlin’s collection interfaces are read-only by default. We will further details on this topic, as well as the mutable counterparts for these interfaces, in 8.2.

Using the standard Java collections makes it much easier to interact with Java code. You don’t need to convert collections one way or the other when you call Java functions from Kotlin or vice versa.

Even though Kotlin’s collections are exactly the same classes as Java collections, you can do much more with them in Kotlin. For example, you can get the last element in a list or sum up a collection (given that it’s a collection of numbers):

fun main() {
val strings = listOf("first", "second", "fourteenth") println(strings.last())
// fourteenth


val numbers = setOf(1, 14, 2) println(numbers.sum())
// 17
}

In this chapter, we’ll explore in detail how this works and where all the new methods on the Java classes come from.

In future chapters, when we start talking about lambdas, you’ll see much more that you can do with collections, but we’ll keep using the same standard Java collection classes. And in 8.2, you’ll learn how the Java collection classes are represented in the Kotlin type system.

Before discussing how the magic functions last and sum work on Java collections, let’s learn some new concepts for declaring a function.

3.2Making functions easier to call
Now that you know how to create a collection of elements, let’s do something straightforward: print its contents. Don’t worry if this seems overly simple; along the way, you’ll meet a bunch of important concepts.

Java collections have a default toString implementation, but the formatting of the output is fixed and not always what you need:

fun main() {
val list = listOf(1, 2, 3)
println(list) #1
// [1, 2, 3]
}

Imagine that you need the elements to be separated by semicolons and surrounded by parentheses, instead of the brackets used by the default implementation: (1; 2; 3). To solve this, Java projects use third-party libraries such as Guava and Apache Commons, or reimplement the logic inside the project. In Kotlin, a function to handle this is part of the standard library.

In this section, you’ll implement this function yourself. You’ll begin with a

straightforward implementation that doesn’t use Kotlin’s facilities for simplifying function declarations, and then you’ll rewrite it in a more idiomatic style.

The joinToString function shown next appends the elements of the collection to a StringBuilder, with a separator between them, a prefix at the beginning, and a postfix at the end. The function is generic: it works on collections that contain elements of any type. The syntax for generics is similar to Java. (A more detailed discussion of generics will be the subject of Chapter 11.)

Listing 3.1. Initial implementation of joinToString()

fun <T> joinToString(
collection: Collection<T>, separator: String, prefix: String,
postfix: String
): String {

val result = StringBuilder(prefix)

for ((index, element) in collection.withIndex()) { if (index > 0) result.append(separator) #1 result.append(element)
}

result.append(postfix) return result.toString()
}

Let’s verify that the function works as intended:

fun main() {
val list = listOf(1, 2, 3) println(joinToString(list, "; ", "(", ")"))
// (1; 2; 3)
}

The implementation is fine, and you’ll mostly leave it as is. What we’ll focus on is the declaration: how can you change it to make calls of this function less verbose? Maybe you could avoid having to pass four arguments every

time you call the function. Let’s see what you can do.

3.2.1Named arguments
The first problem we’ll address concerns the readability of function calls. For example, look at the following call of joinToString:
joinToString(collection, " ", " ", ".")

Can you tell what parameters all these `String`s correspond to? Are the elements separated by the whitespace or the dot? These questions are hard to answer without looking at the signature of the function. Maybe you remember it, or maybe your IDE can help you, but it’s not obvious from the calling code.

This problem is especially common with Boolean flags. To solve it, some Java coding styles recommend creating enum types instead of using Booleans. Others even require you to specify the parameter names explicitly in a comment, as in the following example:

/* Java */
joinToString(collection, /* separator */ " ", /* prefix */ " ",
/* postfix */ ".");

With Kotlin, you can do better:

joinToString(collection, separator = " ", prefix = " ", postfix =

When calling a function written in Kotlin, you can specify the names of some of the arguments that you’re passing to the function. If you specify the names of all arguments passed to the function, you can even change their order:

joinToString(
postfix = ".", separator = " ", collection = collection, prefix = " "
)

Tip

IntelliJ IDEA and Android Studio can keep explicitly written argument names up to date if you rename the parameter of the function being called. Just ensure that you use the "Rename" or "Change Signature" action instead of editing the parameter names by hand. Both actions can be found by right- clicking on the function name and choosing the "Refactor" option.

Named arguments work especially well with default parameter values, which we’ll look at next.

3.2.2Default parameter values
Another common Java problem is the overabundance of overloaded methods in some classes. Just look at java.lang.Thread (http://mng.bz/4KZC) and its eight constructors! The overloads can be provided for the sake of backward compatibility, for convenience of API users, or for other reasons, but the end result is the same: duplication. The parameter names and types are repeated over and over, and if you want to be thorough, you also have to repeat most of the documentation in every overload. At the same time, if you call an overload that omits some parameters, it’s not always clear which values are used for them.

In Kotlin, you can often avoid creating overloads because you can specify default values for parameters in a function declaration. Let’s use that to improve the joinToString function. For most cases, the strings can be separated by commas without any prefix or postfix. So, let’s make these values the defaults.

Listing 3.2. Declaring joinToString() with default parameter values

fun <T> joinToString(
collection: Collection<T>, separator: String = ", ", #1 prefix: String = "", #1 postfix: String = "" #1
): String

Now you can either invoke the function with all the arguments or omit some of them:

fun main() {
joinToString(list, ", ", "", "")
// 1, 2, 3
joinToString(list)
// 1, 2, 3
joinToString(list, "; ")
// 1; 2; 3
}

When using the regular call syntax, you have to specify the arguments in the same order as in the function declaration, and you can omit only trailing arguments. If you use named arguments, you can omit some arguments from the middle of the list and specify only the ones you need, in any order you want:

fun main() {
joinToString(list, suffix = ";", prefix = "# ")
// # 1, 2, 3;
}

Note that the default values of the parameters are encoded in the function being called, not at the call site. If you change the default value and recompile the class containing the function, the callers that haven’t specified a value for the parameter will start using the new default value.

Default values and Java

Given that Java doesn’t have the concept of default parameter values, you have to specify all the parameter values explicitly when you call a Kotlin function with default parameter values from Java. If you frequently need to call a function from Java and want to make it easier to use for Java callers, you can annotate it with @JvmOverloads. This instructs the compiler to generate Java overloaded methods, omitting each of the parameters one by one, starting from the last one.

For example, you may annotate your joinToString function with
@JvmOverloads:

Listing 3.3. Declaring joinToString() with default parameter values

@JvmOverloads

fun <T> joinToString(
collection: Collection<T>, separator: String = ", ", prefix: String = "", postfix: String = ""
): String { /* ... */ }

This means the following overloads are generated:

/* Java */
String joinToString(Collection<T> collection, String separator, String prefix, String postfix);

String joinToString(Collection<T> collection, String separator, String prefix);

String joinToString(Collection<T> collection, String separator); String joinToString(Collection<T> collection);
Each overload uses the default values for the parameters that have been omitted from the signature.

So far, you’ve been working on your utility function without paying much attention to the surrounding context. Surely it must have been a method of some class that wasn’t shown in the example listings, right? In fact, Kotlin makes this unnecessary.

3.2.3Getting rid of static utility classes: top-level functions and properties
We all know that Java, as an object-oriented language, requires all code to be written as methods of classes. Usually, this works out nicely; but in reality, almost every large project ends up with a lot of code that doesn’t clearly belong to any single class. Sometimes an operation works with objects of two different classes that play an equally important role for it. Sometimes there is one primary object, but you don’t want to bloat its API by adding the operation as an instance method.

As a result, you end up with classes that don’t contain any state or any instance methods. Such classes only act as containers for a bunch of static

methods. A perfect example is the Collections class in the JDK. To find other examples in your own code, look for classes that have Util as part of the name.

In Kotlin, you don’t need to create all those meaningless classes. Instead, you can place functions directly at the top level of a source file, outside of any class. Such functions are still members of the package declared at the top of the file, and you still need to import them if you want to call them from other packages, but the unnecessary extra level of nesting no longer exists.

Let’s put the joinToString function into the strings package directly. Create a file called join.kt with the following contents.

Listing 3.4. Declaring joinToString() as a top-level function

package strings

fun joinToString(...): String { ... }

How does this run? When you compile the file, some classes will be produced, because the JVM can only execute code in classes. When you work only with Kotlin, that’s all you need to know. But if you need to call such a function from Java, you have to understand how it will be compiled. To make this clear, let’s look at the Java code that would compile to the same class:

/* Java */ package strings;

public class JoinKt { #1
public static String joinToString(...) { ... }
}

You can see that the name of the class generated by the Kotlin compiler corresponds to the name of the file containing the function—capitalized to match Java’s naming scheme, and suffixed with Kt. All top-level functions in the file are compiled to static methods of that class. Therefore, calling this function from Java is as easy as calling any other static method:

/* Java */

import strings.JoinKt;

...

JoinKt.joinToString(list, ", ", "", "");

Changing the file class name

By default, the class name generated by the compiler corresponds to the file name, together with a "Kt" suffix. To change the name of the generated class that contains Kotlin top-level functions, you add a @JvmName annotation to the file. Place it at the beginning of the file, before the package name:

@file:JvmName("StringFunctions") #1

package strings #2

fun joinToString(...): String { ... }

Now the function can be called as follows:

/* Java */
import strings.StringFunctions; StringFunctions.joinToString(list, ", ", "", "");

A detailed discussion of the annotation syntax comes later, in Chapter 12. Top-level properties
Just like functions, properties can be placed at the top level of a file. Storing individual pieces of data outside of a class isn’t needed as often but is still useful.

For example, you can use a var property to count the number of times some operation has been performed:

var opCount = 0 #1

fun performOperation() { opCount++ #2
// ...
}


fun reportOperationCount() {
println("Operation performed $opCount times") #3
}

The value of such a property will be stored in a static field.

Top-level properties also allow you to define constants in your code:

val UNIX_LINE_SEPARATOR = "\n"

By default, top-level properties, just like any other properties, are exposed to Java code as accessor methods (a getter for a val property and a getter/setter pair for a var property). If you want to expose a constant to Java code as a public static final field, to make its use more natural, you can mark it with the const modifier (this is allowed for properties of primitive types, as well as String):
const val UNIX_LINE_SEPARATOR = "\n"

This gets you the equivalent of the following Java code:

/* Java */
public static final String UNIX_LINE_SEPARATOR = "\n";

You’ve improved the initial joinToString utility function quite a lot. Now let’s look at how to make it even handier.

Note
The Kotlin standard library also contains a number of useful top-level functions and properties. An example for this is the kotlin.math package. It provides useful functions for typical mathematical and trigonometric operations, such as the max function to compute the maximum of two numbers. It also comes with a number of mathematical constants, like Euler’s number, or Pi:

fun main() {
println(max(PI, E))
// 3.141592653589793

}

3.3Adding methods to other people’s classes: extension functions and properties
One of the main themes of Kotlin is smooth integration with existing code. Even pure Kotlin projects are built on top of Java libraries such as the JDK, the Android framework, and other third-party frameworks. And when you integrate Kotlin into a Java project, you’re also dealing with the existing code that hasn’t been or won’t be converted to Kotlin. Wouldn’t it be nice to be able to use all the niceties of Kotlin when working with those APIs, without having to rewrite them? That’s what extension functions allow you to do.

Conceptually, an extension function is a simple thing: it’s a function that can be called as a member of a class but is defined outside of it. To demonstrate that, let’s add a method for computing the last character of a string:

package strings

fun String.lastChar(): Char = this.get(this.length - 1)

All you need to do is put the name of the class or interface that you’re extending before the name of the function you’re adding. This class name is called the receiver type; the value on which you’re calling the extension function is called the receiver object. This is illustrated in 3.1.

Figure 3.1. In an extension function declaration, the receiver type is the type on which the extension is defined. You use it to specify the type your function extends. The receiver object is the instance of that type. You use it to access properties and methods of the type you’re extending.


You can call the function using the same syntax you use for ordinary class members:

fun main() {
println("Kotlin".lastChar())
// n
}

In this example, String is the receiver type, and "Kotlin" is the receiver object.

In a sense, you’ve added your own method to the String class. Even though String isn’t part of your code, and you may not even have the source code to that class, you can still extend it with the methods you need in your project. It doesn’t even matter whether String is written in Java, Kotlin, or some other JVM language, such as Groovy, or even whether it is marked as final, preventing subclassing. As long as it’s compiled to a Java class, you can add your own extensions to that class.

In the body of an extension function, you use this the same way you would use it in a method. And, as in a regular method, you can omit it:

package strings

fun String.lastChar(): Char = get(length - 1) #1

In the extension function, you can directly access the methods and properties of the class you’re extending, as in methods defined in the class itself. Note that extension functions don’t allow you to break encapsulation. Unlike methods defined in the class, extension functions don’t have access to private or protected members of the class.

Later we’ll use the term method for both members of the class and extensions functions. For instance, we can say that in the body of the extension function you can call any method on the receiver, meaning you can call both members and extension functions. On the call site, extension functions are indistinguishable from members, and often it doesn’t matter whether the particular method is a member or an extension.

3.3.1Imports and extension functions

When you define an extension function, it doesn’t automatically become available across your entire project. Instead, it needs to be imported, just like any other class or function. This helps avoid accidental name conflicts. Kotlin allows you to import individual functions using the same syntax you use for classes:

import strings.lastChar val c = "Kotlin".lastChar()
Of course, * imports work as well:
import strings.*

val c = "Kotlin".lastChar()

You can change the name of the class or function you’re importing using the
as keyword:
import strings.lastChar as last val c = "Kotlin".last()
Changing a name on import is useful when you have several functions with the same name in different packages and you want to use them in the same file. For regular classes or functions, you have another choice in this situation: You can use a fully qualified name to refer to the class or function (and whether you can import a class or function at all also depends on its visibility modifier, as you’ll see in 4.1.3.) For extension functions, the syntax requires you to use the short name, so the as keyword in an import statement is the only way to resolve the conflict.

3.3.2Calling extension functions from Java

Under the hood, an extension function is a static method that accepts the receiver object as its first argument. Calling it doesn’t involve creating adapter objects or any other runtime overhead.

That makes using extension functions from Java pretty easy: you call the static method and pass the receiver object instance. Just as with other top- level functions, the name of the Java class containing the method is determined from the name of the file where the function is declared. Let’s say it was declared in a StringUtil.kt file:

/* Java */
char c = StringUtilKt.lastChar("Java");

This extension function is declared as a top-level function, so it’s compiled to a static method. You can import the lastChar method statically from Java, simplifying the use to just lastChar("Java"). This code is somewhat less readable than the Kotlin version, but it’s idiomatic from the Java point of view.

3.3.3Utility functions as extensions

Now you can write the final version of the joinToString function. This is almost exactly what you’ll find in the Kotlin standard library.

Listing 3.5. Declaring joinToString() as an extension

fun <T> Collection<T>.joinToString( #1 separator: String = ", ", #2 prefix: String = "", #2 postfix: String = "" #2
): String {
val result = StringBuilder(prefix)

for ((index, element) in this.withIndex()) { #3 if (index > 0) result.append(separator) result.append(element)
}

result.append(postfix) return result.toString()
}

fun main() {
val list = listOf(1, 2, 3) println(
list.joinToString(

separator = "; ", prefix = "(", postfix = ")"
)
)
// (1; 2; 3)
}

You make it an extension to a collection of elements, and you provide default values for all the arguments. Now you can invoke joinToString like a member of a class:

fun main() {
val list = listOf(1, 2, 3) println(list.joinToString(" "))
// 1 2 3
}

Because extension functions are effectively syntactic sugar over static method calls, you can use a more specific type as a receiver type, not only a class. Let’s say you want to have a join function that can be invoked only on collections of strings.

fun Collection<String>.join( separator: String = ", ", prefix: String = "", postfix: String = ""
) = joinToString(separator, prefix, postfix)

fun main() {
println(listOf("one", "two", "eight").join(" "))
// one two eight
}

Calling this function with a list of objects of another type won’t work:

fun main() {
listOf(1, 2, 8).join()
// Error: None of the following candidates is applicable beca
// receiver type mismatch:
// public fun Collection<String>.join(...): String
// defined in root package
}

The static nature of extensions also means that extension functions can’t be overridden in subclasses. Let’s look at an example.

3.3.4No overriding for extension functions
Method overriding in Kotlin works as usual for member functions, but you can’t override an extension function. Let’s say you have two classes, View and Button. Button is a subclass of View, and overrides the click function from the superclass. To implement this, you mark View and click with the open modifier to allow overriding, and use the override modifier to provide an an implementation in the subclass (we’ll take a closer look at this syntax in 4.1.1, and learn more about the syntax for instantiating subclasses in 4.2.1).

Listing 3.6. Overriding a member function

open class View { #1
open fun click() = println("View clicked")
}

class Button: View() { #2
override fun click() = println("Button clicked")
}

If you declare a variable of type View, you can store a value of type Button in that variable, because Button is a subtype of View. If you call a regular method, such as click, on this variable, and that method is overridden in the Button class, the overridden implementation from the Button class will be used:

fun main() {
val view: View = Button() view.click() #1
// Button clicked
}

But it doesn’t work that way for extensions.Extension functions aren’t a part of the class; they’re declared externally to it, as shown in 3.2.

Figure 3.2. The View.showOff() and Button.showOff() extension functions are defined outside the

View and Button classes.


Even though you can define extension functions with the same name and parameter types for a base class and its subclass, the function that’s called depends on the declared static type of the variable, determined at compile time, not on the runtime type of the value stored in that variable.

The following example shows two showOff extension functions declared on the View and Button classes.When you call showOff on a variable of type View, the corresponding extension is called, even though the actual type of the value is Button:

Listing 3.7. No overriding for extension functions

fun View.showOff() = println("I'm a view!") fun Button.showOff() = println("I'm a button!")

fun main() {
val view: View = Button() view.showOff() #1
// I'm a view!
}

It might help to recall that an extension function is compiled to a static function in Java with the receiver as the first argument.Java would choose the function the same way:

/* Java */ class Demo {
public static void main(String[] args) { View view = new Button(); ExtensionsKt.showOff(view); #1
// I'm a view!
}
}

As you can see, overriding doesn’t apply to extension functions: Kotlin resolves them statically.

Note
If the class has a member function with the same signature as an extension function, the member function always takes precedence. You should keep this in mind when extending the API of classes: if you add a member function with the same signature as an extension function that a client of your class has defined, and they then recompile their code, it will change its meaning and start referring to the new member function. Your IDE will also warn you that the extension function is shadowed by a member function.

We’ve discussed how to provide additional methods for external classes. Now let’s see how to do the same with properties.

3.3.5Extension properties
You’ve already gotten to know the syntax for declaring Kotlin properties in 2.2.1, and just like extension functions, you can also specify extension properties.These allow you to extend classes with APIs that can be accessed using the property syntax, rather than the function syntax. Even though they’re called properties , they can’t have any state, because there’s no proper place to store it: it’s not possible to add extra fields to existing instances of Java objects.As a result, extension properties always have to define custom

accessors like the ones you learned about in 2.2.2.Still, they provide a shorter, more concise calling convention, which can still come in handy sometimes.

In the previous section, you defined a function lastChar(). Now let’s convert it into a property—allowing you to call "myText".lastChar instead of "myText.lastChar().

Listing 3.8. Declaring an extension property

val String.lastChar: Char
get() = this.get(length - 1)

You can see that, just as with functions, an extension property looks like a regular property with a receiver type added. The getter must always be defined, because there’s no backing field and therefore no default getter implementation. Initializers aren’t allowed for the same reason: there’s nowhere to store the value specified as the initializer.

If you define the same property on a StringBuilder, you can make it a var, because the contents of a StringBuilder can be modified.

Listing 3.9. Declaring a mutable extension property

var StringBuilder.lastChar: Char get() = this.get(length - 1) #1
set(value) { #2 this.setCharAt(length - 1, value)
}

You access extension properties exactly like member properties:

fun main() {
val sb = StringBuilder("Kotlin?") println(sb.lastChar)
// ?
sb.lastChar = '!' println(sb)
// Kotlin!
}

Note that when you need to access an extension property from Java, you have

to invoke its getter explicitly: StringUtilKt.getLastChar("Java").
We’ve discussed the concept of extensions in general. Now let’s return to the topic of collections and look at a few more library functions that help you handle them, as well as language features that come up in those functions.

3.4Working with collections: varargs, infix calls, and library support
This section shows some of the functions from the Kotlin standard library for working with collections. Along the way, it describes a few related language features:

The vararg keyword, which allows you to declare a function taking an arbitrary number of arguments
An infix notation that lets you call some one-argument functions without ceremony
Destructuring declarations that allow you to unpack a single composite value into multiple variables

3.4.1Extending the Java Collections API
We started this chapter with the idea that collections in Kotlin are the same classes as in Java, but with an extended API. You saw examples of getting the last element in a list and finding the maximum in a collection of numbers:

fun main() {
val strings: List<String> = listOf("first", "second", "fourte strings.last()
// fourteenth

val numbers: Collection<Int> = setOf(1, 14, 2) numbers.sum()
// 17
}

We were interested in how it works: why it’s possible to do so many things with collections in Kotlin out of the box, even though they’re instances of the

Java library classes. Now the answer should be clear: the last and sum functions are declared as extension functions, and are always imported by default in your Kotlin files!

The last function is no more complex than lastChar for String, discussed in the previous section: it’s an extension on the List class. For sum, we show a simplified declaration (the real library function works not only for Int numbers, but for any number types):

fun <T> List<T>.last(): T { /* returns the last element */ } fun Collection<Int>.sum(): Int { /* sum up all elements */ }

Many extension functions are declared in the Kotlin standard library, and we won’t list all of them here. You may wonder about the best way to learn everything in the Kotlin standard library. You don’t have to—any time you need to do something with a collection or any other object, the code completion in the IDE will show you all the possible functions available for that type of object. The list includes both regular methods and extension functions; you can choose the function you need. In addition to that, the standard library reference (https://kotlinlang.org/api/latest/jvm/stdlib/) lists all the methods available for each library class—members as well as extensions.

At the beginning of the chapter, you also saw functions for creating collections. A common trait of those functions is that they can be called with an arbitrary number of arguments. In the following section, you’ll see the syntax for declaring such functions.

3.4.2Varargs: functions that accept an arbitrary number of arguments
When you call a function to create a list, you can pass any number of arguments to it:

val list = listOf(2, 3, 5, 7, 11)

If you look up how this function is declared in the standard library, you’ll find the following signature:

fun listOf<T>(vararg values: T): List<T> { /* implementation */ }

This method makes use of a language feature that allows you to pass an arbitrary number of values to a method by packing them in an array: varargs. Kotlin’s varargs are similar to those in Java, but the syntax is slightly different: instead of three dots after the type, Kotlin uses the vararg modifier on the parameter.

One other difference between Kotlin and Java is the syntax of calling the function when the arguments you need to pass are already packed in an array. In Java, you pass the array as is, whereas Kotlin requires you to explicitly unpack the array, so that every array element becomes a separate argument to the function being called. This feature is called a spread operator, and using it is as simple as putting the * character before the corresponding argument.In this snippet, you’re "spreading" the args array received by the main function to be used as variable arguments for the listOf function:

fun main(args: Array<String>) {
val list = listOf("args: ", *args) #1 println(list)
}

This example shows that the spread operator lets you combine the values from an array and some fixed values in a single call. This isn’t supported in Java.

Now let’s move on to maps. We’ll briefly discuss another way to improve the readability of Kotlin function invocations: the infix call.

3.4.3Working with pairs: infix calls and destructuring declarations
To create maps, you use the mapOf function:
val map = mapOf(1 to "one", 7 to "seven", 53 to "fifty-three")

This is a good time to provide another explanation we promised you at the beginning of the chapter. The word to in this line of code isn’t a built-in construct, but rather a method invocation of a special kind, called an infix call.

In an infix call, the method name is placed immediately between the target object name and the parameter, with no extra separators. The following two calls are equivalent:

1.to("one") #1
1 to "one" #2

Infix calls can be used with regular methods and extension functions that have exactly one required parameter. To allow a function to be called using the infix notation, you need to mark it with the infix modifier. Here’s a simplified version of the declaration of the to function:
infix fun Any.to(other: Any) = Pair(this, other)

The to function returns an instance of Pair, which is a Kotlin standard library class that, unsurprisingly, represents a pair of elements. The actual declarations of Pair and to use generics, but we’re omitting them here to keep things simple.

Note that you can initialize two variables with the contents of a Pair directly:
val (number, name) = 1 to "one"

This feature is called a destructuring declaration. 3.3 illustrates how it works with pairs.

Figure 3.3. You create a pair using the to function and unpack it with a destructuring declaration.



The destructuring declaration feature isn’t limited to pairs. For example, you can also initialize two variables, key and value, with the contents of a map entry (something you’ve already seen very briefly in 2.25).

This also works with loops, as you’ve seen in the implementation of
joinToString, which uses the withIndex function:
for ((index, element) in collection.withIndex()) { println("$index: $element")
}

9.4 will describe the general rules for destructuring an expression and using it to initialize several variables.

The to function is an extension function. You can create a pair of any elements, which means it’s an extension to a generic receiver: you can write 1 to "one", "one" to 1, list to list.size(), and so on. Let’s look at the signature of the mapOf function:
fun <K, V> mapOf(vararg values: Pair<K, V>): Map<K, V>

Like listOf, mapOf accepts a variable number of arguments, but this time they should be pairs of keys and values. Even though the creation of a new map may look like a special construct in Kotlin, it’s a regular function with a concise syntax.

Next, let’s discuss how extensions simplify dealing with strings and regular expressions.

3.5Working with strings and regular expressions
Kotlin strings are exactly the same things as Java strings. You can pass a string created in Kotlin code to any Java method, and you can use any Kotlin standard library methods on strings that you receive from Java code. No conversion is involved, and no additional wrapper objects are created.

Kotlin makes working with standard Java strings more enjoyable by providing a bunch of useful extension functions. Also, it hides some confusing methods, adding extensions that are clearer. As our first example of the API differences, let’s look at how Kotlin handles splitting strings.

3.5.1Splitting strings
You’re probably familiar with the split method on String. Everyone uses it, but sometimes people complain about it on Stack Overflow (http://stackoverflow.com): "The split method in Java doesn’t work with a dot." It’s a common trap to write "12.345-6.A".split(".") and to expect an array [12, 345-6, A] as a result. But Java’s split method returns an empty array! That happens because it takes a regular expression as a parameter, and it splits a string into several strings according to the expression. Here, the dot (.) is a regular expression that denotes any character.

Kotlin hides the confusing method and provides as replacements several overloaded extensions named split that have different arguments. The one that takes a regular expression requires a value of type Regex or Pattern, not String. This ensures that it’s always clear whether a string passed to a method is interpreted as plain text or a regular expression.

Here’s how you’d split the string with either a dot or a dash:

fun main() {
println("12.345-6.A".split("\\.|-".toRegex())) #1
// [12, 345, 6, A]
}

Kotlin uses exactly the same regular expression syntax as in Java. The pattern here matches a dot (we escaped it to indicate that we mean a literal character, not a wildcard) or a dash. The APIs for working with regular expressions are also similar to the standard Java library APIs, but they’re more idiomatic. For instance, in Kotlin you use an extension function toRegex to convert a string into a regular expression.

But for such a simple case, you don’t need to use regular expressions. The other overload of the split extension function in Kotlin takes an arbitrary number of delimiters as plain-text strings:

fun main() {
println("12.345-6.A".split(".", "-")) #1
// [12, 345, 6, A]
}

Note that you can specify character arguments instead and write "12.345- 6.A".split('.', '-'), which will lead to the same result. This method replaces the similar Java method that can take only one character as a delimiter.

3.5.2Regular expressions and triple-quoted strings
Let’s look at another example with two different implementations: the first one will use extensions on String, and the second will work with regular expressions. Your task will be to parse a file’s full path name into its

components: a directory, a filename, and an extension. The Kotlin standard library contains functions to get the substring before (or after) the first (or the last) occurrence of the given delimiter. Here’s how you can use them to solve this task (also see 3.4).

Figure 3.4. Splitting a path into a directory, a filename, and a file extension by using the
substringBeforeLast and substringAfterLast functions


Listing 3.10. Using String extensions for parsing paths

fun parsePath(path: String) {
val directory = path.substringBeforeLast("/") val fullName = path.substringAfterLast("/")

val fileName = fullName.substringBeforeLast(".") val extension = fullName.substringAfterLast(".")

println("Dir: $directory, name: $fileName, ext: $extension")
}

fun main() {
parsePath("/Users/yole/kotlin-book/chapter.adoc")
// Dir: /Users/yole/kotlin-book, name: chapter, ext: adoc
}

The substring before the last slash symbol of the file path is the path to an enclosing directory, the substring after the last dot is a file extension, and the filename goes between them.

Kotlin makes it easier to work with strings without resorting to regular expressions, which are powerful but also sometimes hard to understand after they’ve been written. If you do want to use regular expressions, the Kotlin standard library can help. Here’s how the same task can be done using regular expressions:

Listing 3.11. Using regular expressions for parsing paths

fun parsePathRegex(path: String) {
val regex = """(.+)/(.+)\.(.+)""".toRegex() val matchResult = regex.matchEntire(path) if (matchResult != null) {
val (directory, filename, extension) = matchResult.destru println("Dir: $directory, name: $filename, ext: $extensio
}
}

fun main() {
parsePathRegex("/Users/yole/kotlin-book/chapter.adoc")
// Dir: /Users/yole/kotlin-book, name: chapter, ext: adoc
}

In this example, the regular expression is written in a triple-quoted string. In such a string, you don’t need to escape any characters, including the backslash, so you can encode a regular expression matching a literal dot with
\. rather than \\. as you’d write in an ordinary string literal (see 3.5).

Figure 3.5. The regular expression for splitting a path into a directory, a filename, and a file extension



This regular expression divides a path into three groups separated by a slash and a dot. The pattern . matches any character from the beginning, so the first group (.+) contains the substring before the last slash. This substring includes all the previous slashes, because they match the pattern "any character". Similarly, the second group contains the substring before the last dot, and the third group contains the remaining part.

Now let’s discuss the implementation of the parsePathRegex function from the previous example. You create a regular expression and match it against an input path. If the match is successful (the result isn’t null), you assign the value of its destructured property to the corresponding variables. This is the same syntax used when you initialized two variables with a Pair; 9.4 will cover the details.

3.5.3Multiline triple-quoted strings
The purpose of triple-quoted strings is not only to avoid escaping characters. Such a string literal can contain any characters, including line breaks. That gives you an easy way to embed in your programs text containing line breaks. As an example, let’s draw some ASCII art:

val kotlinLogo = """
| //
|//

|/ \ """.trimIndent()

fun main() {
println(kotlinLogo)
// | //
// |//
// |/ \
}

The multiline string contains all the characters between the triple quotes. That includes the line breaks[2] and indents used to format the code. In cases like this, you are most likely only interested in the actual content of your string.
By calling trimIndent, you can remove that common minimal indent of all the lines of your string, and remove the first and last lines of the string, given that they are blank.

As you saw in the previous example, a triple-quoted string can contain line breaks. However, you can’t use special characters like \n. On the other hand, you don’t have to escape \, so the Windows-style path "C:\\Users\\yole\\kotlin-book" can be written as """C:\Users\yole\kotlin-book""".
You can also use string templates in multiline strings. Because multiline strings don’t support escape sequences, you have to use an embedded expression if you need to use a literal dollar sign or an escaped Unicode symbol in the contents of your string. So, rather than write val think = """Hmm \uD83E\uDD14""", you’ll have to write the following to properly interpret the escaped symbol encoded in this string: val think = """Hmm
${"\uD83E\uDD14"}"""

One of the areas where multiline strings can be useful in your programs (besides games that use ASCII art) is tests. In tests, it’s fairly common to execute an operation that produces multiline text (for example, a web page fragment, or other structured text) and to compare the result with the expected output. Multiline strings give you a perfect solution for including the expected output as part of your tests. No need for clumsy escaping or loading the text from external files—just put in some quotation marks and place the expected HTML, XML, JSON, or other output between them. And for better formatting, use the aforementioned trimIndent function, which is

another example of an extension function:

val expectedPage = """
<html lang="en">
<head>
<title>A page</title>
</head>
<body>
<p>Hello, Kotlin!</p>
</body>
</html> """.trimIndent()

val expectedObject = """
{
"name": "Sebastian", "age": 27, "homeTown": "Munich"
}
""".trimIndent()

Syntax highlighting inside triple-quoted strings in IntelliJ IDEA and Android Studio
Using triple-quoted strings for formatted text like HTML or JSON gives you an additional benefit: IntelliJ IDEA and Android Studio can provide you with syntax highlighting inside those string literals.To enable highlighting, place your cursor inside the string, and press Alt + Enter (or Option + Return on macOS) or click the floating yellow lightbulb icon, and select "Inject language or reference".Next, select the type of language you’re using in the string, e.g. JSON.

Your multine line string then becomes properly syntax-highlighted JSON.In case your text snippet happens to be malformed JSON, you’ll even get warnings and descriptive error messages, all within your Kotlin string.

By default, this highlighting is temporary.To instruct your IDE to always inject a string literal with a given language, you can use the @Language("JSON") annotation:
For more information on language injections in IntelliJ IDEA and Android Studio, take a look at https://www.jetbrains.com/help/idea/using-language-

injections.html.

You can now see that extension functions are a powerful way to extend the APIs of existing libraries and to adapt them to the idioms of the Kotlin language. And indeed, a large portion of the Kotlin standard library is made up of extension functions for standard Java classes. You can also find many community-developed libraries that provide Kotlin-friendly extensions for third-party libraries.

Now that you can see how Kotlin gives you better APIs for the libraries you use, let’s turn our attention back to your code. You’ll see some new uses for extension functions, and we’ll also discuss a new concept: local functions.

[2]Different operating systems use different characters to mark the end of a line in a file: Windows uses CRLF (Carriage Return Line Feed), Linux and macOS uses LF (Line Feed). Regardless of the used operating system, Kotlin interprets CRLF, LF, and CR as line breaks.

3.6Making your code tidy: local functions and extensions
Many developers believe that one of the most important qualities of good code is the lack of duplication. There’s even a special name for this principle: Don’t Repeat Yourself (DRY). But when you write in Java, following this principle isn’t always trivial. In many cases, it’s possible to use the Extract Method refactoring feature of your IDE to break longer methods into smaller chunks, and then to reuse those chunks. But this can make code more difficult to understand, because you end up with a class with many small methods and no clear relationship between them. You can go even further and group the extracted methods into an inner class, which lets you maintain the structure, but this approach requires a significant amount of boilerplate.

Kotlin gives you a cleaner solution: you can nest the functions you’ve extracted in the containing function. This way, you have the structure you need without any extra syntactic overhead.

Let’s see how to use local functions to fix a fairly common case of code

duplication. In 3.12, a function saves a user to a database, and you need to make sure the user object contains valid data.

Listing 3.12. A function with repetitive code
class User(val id: Int, val name: String, val address: String) fun saveUser(user: User) {
if (user.name.isEmpty()) { #1 throw IllegalArgumentException(
"Can't save user ${user.id}: empty Name")
}

if (user.address.isEmpty()) { #1 throw IllegalArgumentException(
"Can't save user ${user.id}: empty Address")
}

// Save user to the database
}

fun main() {
saveUser(User(1, "", ""))
// java.lang.IllegalArgumentException: Can't save user 1: emp
}

The amount of duplicated code here is fairly small, and you probably won’t want to have a full-blown method in your class that handles one special case of validating a user. But if you put the validation code into a local function, you can get rid of the duplication and still maintain a clear code structure.
Here’s how it works.

Listing 3.13. Extracting a local function to avoid repetition

class User(val id: Int, val name: String, val address: String) fun saveUser(user: User) {
fun validate(user: User, #1
value: String, fieldName: String) {
if (value.isEmpty()) {
throw IllegalArgumentException(
"Can't save user ${user.id}: empty $fieldName")

}
}

validate(user, user.name, "Name") #2 validate(user, user.address, "Address")

// Save user to the database
}

This looks better. The validation logic isn’t duplicated, but it’s still confined to the scope of the validate function.As the project evolves, you can easily add more validations if you need to add other fields to User. But having to pass the User object to the validation function is somewhat ugly. The good news is that it’s entirely unnecessary, because local functions have access to all parameters and variables of the enclosing function. Let’s take advantage of that and get rid of the extra User parameter.

Listing 3.14. Accessing outer function parameters in a local function
class User(val id: Int, val name: String, val address: String) fun saveUser(user: User) {
fun validate(value: String, fieldName: String) { #1 if (value.isEmpty()) {
throw IllegalArgumentException(
"Can't save user ${user.id}: " + #2 "empty $fieldName")
}
}

validate(user.name, "Name") validate(user.address, "Address")

// Save user to the database
}

To improve this example even further, you can move the validation logic into an extension function of the User class.

Listing 3.15. Extracting the logic into an extension function

class User(val id: Int, val name: String, val address: String)

fun User.validateBeforeSave() {
fun validate(value: String, fieldName: String) { if (value.isEmpty()) {
throw IllegalArgumentException(
"Can't save user $id: empty $fieldName") #1
}
}

validate(name, "Name") validate(address, "Address")
}

fun saveUser(user: User) { user.validateBeforeSave() #2

// Save user to the database
}

Extracting a piece of code into an extension function turns out to be surprisingly useful. Even though User is a part of your codebase and not a library class, you don’t want to put this logic into a method of User, because it’s not relevant to any other places where User is used. If you follow this approach the API of the class contains only the essential methods used everywhere, so the class remains small and easy to wrap your head around. On the other hand, functions that primarily deal with a single object and don’t need access to its private data can access its members without extra qualification, as in 3.15.

Extension functions can also be declared as local functions, so you could go even further and put User.validateBeforeSave as a local function in saveUser. But deeply nested local functions are usually fairly hard to read; so, as a general rule, we don’t recommend using more than one level of nesting.

Having looked at all the cool things you can do with functions, in the next chapter we’ll look at what you can do with classes.

3.7Summary

Kotlin enhances the Java collection classes with a richer API.
Defining default values for function parameters greatly reduces the need

to define overloaded functions, and the named-argument syntax makes calls to functions with many parameters much more readable.
Functions and properties can be declared directly in a file, not just as members of a class, allowing for a more flexible code structure.
Extension functions and properties let you extend the API of any class, including classes defined in external libraries, without modifying its source code and with no runtime overhead.
Infix calls provide a clean syntax for calling operator-like methods with a single argument.
Kotlin provides a large number of convenient string-handling functions for both regular expressions and plain strings.
Triple-quoted strings provide a clean way to write expressions that would require a lot of noisy escaping and string concatenation in Java. Local functions help you structure your code more cleanly and eliminate duplication.
