9Operator overloading and other conventions
This chapter covers

Operator overloading
Conventions: special-named functions supporting various operations Delegated properties

Kotlin has a number of features where specific language constructs are implemented by calling functions that you define in your own code. You already may be familiar with these types of constructs from Java, where objects that implement the java.lang.Iterable interface can be used in for loops, and objects that implement the java.lang.AutoCloseable interface can be used in try-with-resources statements.

In Kotlin, such features are tied to functions with specific names (and not bound to some special interfaces in the standard library, like they are in Java). For example, if your class defines a special method named plus, then, by convention, you can use the + operator on instances of this class. Because of that, in Kotlin we refer to this technique as conventions. In this chapter, we’ll look at different conventions supported by Kotlin and how they can be used.

Kotlin uses the principle of conventions, instead of relying on types as Java does, because this allows developers to adapt existing Java classes to the requirements of Kotlin language features. Kotlin code can’t modify third- party classes so that they would implement additional interfaces. On the other hand, defining new methods for a class is possible through the mechanism of extension functions. You can define any convention methods as extensions and thereby adapt any existing Java class without modifying its code.

As a running example in this chapter, we’ll use a simple Point class, representing a point on a screen. Such classes are available in most UI frameworks, and you can easily adapt the definitions shown here to your

environment:

data class Point(val x: Int, val y: Int)

Let’s begin by defining some arithmetic operators on the Point class.

9.1Overloading arithmetic operators makes operations for arbitrary classes more convenient
The most straightforward example of the use of conventions in Kotlin is arithmetic operators. In Java, the full set of arithmetic operations can be used only with primitive types, and additionally the + operator can be used with String values. But these operations could be convenient in other cases as well. For example, if you’re working with numbers through the BigInteger class, it would be more elegant to sum them using + than to call the add method explicitly. To add an element to a collection, you may want to use the
+= operator. Kotlin allows you to do that, and in this section we’ll show you how it works.

9.1.1Plus, times, divide, and more: Overloading binary arithmetic operations
The first operation you’re going to support is adding two points together. This operation sums up the points' X and Y coordinates. Here’s how you can implement it.

Listing 9.1. Defining the plus operator

data class Point(val x: Int, val y: Int) { operator fun plus(other: Point): Point { #1
return Point(x + other.x, y + other.y) #2
}
}

fun main() {
val p1 = Point(10, 20) val p2 = Point(30, 40) println(p1 + p2) #3
// Point(x=40, y=60)

}

Note how you use the operator keyword to declare the plus function. All functions used to overload operators need to be marked with that keyword. This makes it explicit that you intend to use the function as an implementation of the corresponding convention and that you didn’t define a function that accidentally had a matching name.

After you declare the plus function with the operator modifier, you can sum up your objects using just the + sign. Under the hood, the plus function is called as shown in 9.1.

Figure 9.1. The + operator is transformed into a plus function call.


As an alternative to declaring the operator as a member, you can define the operator as an extension function.

Listing 9.2. Defining an operator as an extension function

operator fun Point.plus(other: Point): Point { return Point(x + other.x, y + other.y)
}

The implementation is exactly the same. Future examples will use the extension function syntax because it’s a common pattern to define convention extension functions for external library classes, and the same syntax will work nicely for your own classes as well.

Compared to some other languages, defining and using overloaded operators in Kotlin is simpler, because you can’t define your own operators. For cases where you want to be able to use a function between two operands, i.e. a myOp b, Kotlin offers infix functions, which you have seen in 3.4, and will revisit again in Chapter 13. These allow you to leverage the main syntax benefit of custom operators—having operands on each side of the function call—without introducing arbitrary symbol combinations whose meaning you will have to painstakingly remember.

Kotlin has a limited set of operators that you can overload, and each one corresponds to the name of the function you need to define in your class. 9.1 lists all the binary operators you can define and the corresponding function names.

Table 9.1. Overloadable binary arithmetic operators


Expression	Function name

a * b
times

a / b
div

a % b
mod

a + b
plus

a - b
minus

Operators for your own types always use the same precedence as the standard numeric types. For example, if you write a + b * c, the multiplication will always be executed before the addition, even if you’ve defined those operators yourself. The operators *, /, and % have the same precedence, which is higher than the precedence of the + and - operators.

Operator functions and Java

Kotlin operators are easy to call from Java: because every overloaded operator is defined as a Kotlin function (with the operator modifier), you call them as regular functions using the full name. When you call Java from Kotlin, you can use the operator syntax for any methods with names matching the Kotlin conventions. Because Java doesn’t define any syntax for marking operator functions, the requirement to use the operator modifier

doesn’t apply, and the matching name and number of parameters are the only constraints. If a Java class defines a method with the behavior you need but gives it a different name, you can define an extension function with the correct name that would delegate to the existing Java method.

When you define an operator, you don’t need to use the same types for the two operands. For example, let’s define an operator that will allow you to scale a point by a certain number. You can use it to translate points between different coordinate systems.

Listing 9.3. Defining an operator with different operand types

operator fun Point.times(scale: Double): Point {
return Point((x * scale).toInt(), (y * scale).toInt())
}

fun main() {
val p = Point(10, 20) println(p * 1.5)
// Point(x=15, y=30)
}

Note that Kotlin operators don’t automatically support commutativity (the ability to swap the left and right sides of an operator). If you want users to be able to write 1.5 * p in addition to p * 1.5, you need to define a separate operator for that: operator fun Double.times(p: Point): Point.
The return type of an operator function can also be different from either of the operand types. For example, you can define an operator to create a string by repeating a character a number of times.

Listing 9.4. Defining an operator with a different return type

operator fun Char.times(count: Int): String { return toString().repeat(count) #1
}

fun main() {
println('a' * 3)
// aaa
}

This operator takes a Char as the left operand and an Int as the right operand and has String as the result type. Such combinations of operand and result types are perfectly acceptable.

Note that you can overload operator functions like regular functions: you can define multiple methods with different parameter types for the same method name.

No special operators for bitwise operations

Kotlin doesn’t define any bitwise operators for standard number types (both signed as unsigned, as you have gotten to know them in 8.1); consequently, it doesn’t allow you to define them for your own types. Instead, it uses regular functions supporting the infix call syntax which you saw in 3.4. You can define similar functions that work with your own types.

Here’s the full list of functions provided by Kotlin for performing bitwise operations:

shl—Signed shift left shr—Signed shift right ushr—Unsigned shift right and—Bitwise and or—Bitwise or xor—Bitwise xor inv—Bitwise inversion
The following example demonstrates the use of some of these functions:

fun main() {
println(0x0F and 0xF0)
// 0
println(0x0F or 0xF0)
// 255
println(0x1 shl 4)
// 16
}

Now let’s discuss the operators like += that merge two actions: assignment and the corresponding arithmetic operator.

9.1.2Applying an operation and immediately assigning its value: Overloading compound assignment operators
Normally, when you define an operator such as plus, Kotlin supports not only the + operation but += as well. Operators such as +=, -=, and so on are called compound assignment operators. Here’s an example:

fun main() {
var point = Point(1, 2) point += Point(3, 4) println(point)
// Point(x=4, y=6)
}

This is the same as writing point = point + Point(3, 4). Of course, that works only if the variable is mutable.

In some cases, it makes sense to define the += operation that would modify an object referenced by the variable on which it’s used, but not reassign the reference. One such case is adding an element to a mutable collection:

fun main() {
val numbers = mutableListOf<Int>() numbers += 42
println(numbers[0])
// 42
}

If you define a function named plusAssign with the Unit return type and mark it with the operator keyword, Kotlin will call it when the += operator is used. Other binary arithmetic operators have similarly named counterparts: minusAssign, timesAssign, and so on.
The Kotlin standard library defines a function plusAssign on a mutable collection, and the previous example uses it:

operator fun <T> MutableCollection<T>.plusAssign(element: T) { this.add(element)
}

When you write += in your code, theoretically both plus and plusAssign

functions can be called (see 9.2). If this is the case, and both functions are defined and applicable, the compiler reports an error. One possibility to resolve it is replacing your use of the operator with a regular function call. Another is to replace a var with a val, so that the plusAssign operation becomes inapplicable. But in general, it’s best to design new classes consistently: try not to add both plus and plusAssign operations at the same time. If your class is immutable, like Point in one of the earlier examples, you should provide only operations that return a new value (such as plus). If you design a mutable class, like a builder, provide only plusAssign and similar operations.

Figure 9.2. The += operator can be transformed into either the plus or the plusAssign function call.



The Kotlin standard library supports both approaches for collections. The + and - operators always return a new collection. The += and -= operators work on mutable collections by modifying them in place, and on read-only collections by returning a modified copy. (This means += and -= can only be used with a read-only collection if the variable referencing it is declared as a var.) As operands of those operators, you can use either individual elements or other collections with a matching element type:

fun main() {
val list = mutableListOf(1, 2) list += 3 #1
val newList = list + listOf(4, 5) #2 println(list)
// [1, 2, 3]
println(newList) [1, 2, 3, 4, 5]
}

So far, we’ve discussed overloading of binary operators—operators that are applied to two values, such as a + b. In addition, Kotlin allows you to

overload unary operators, which are applied to a single value, as in -a.

9.1.3Operators with only one operand: Overloading unary operators
The procedure for overloading a unary operator is the same as you saw previously: declare a function (member or extension) with a predefined name, and mark it with the modifier operator. Let’s look at an example.

Listing 9.5. Defining unary arithmetic operator

operator fun Point.unaryMinus(): Point { #1 return Point(-x, -y) #2
}

fun main() {
val p = Point(10, 20) println(-p)
// Point(x=-10, y=-20)
}

Functions used to overload unary operators don’t take any arguments. As shown in 9.3, the unary plus operator works the same way. 9.2 lists all the unary operators you can overload.

Figure 9.3. The unary + operator is transformed into a unaryPlus function call.


Table 9.2. Overloadable unary arithmetic operators


Expression	Function name

+a
unaryPlus

-a
unaryMinus


!a	not

++a, a++
inc

--a, a--
dec

When you define the inc and dec functions to overload increment and decrement operators, the compiler automatically supports the same semantics for pre- and post-increment operators as for the regular number types.
Consider the following example, which overloads the ++ operator for the
BigDecimal class.

Listing 9.6. Defining an increment operator

import java.math.BigDecimal
operator fun BigDecimal.inc() = this + BigDecimal.ONE fun main() {
var bd = BigDecimal.ZERO println(bd++) #1
// 0 println(bd)
// 1
println(++bd) #2
// 2
}

The postfix operation ++ first returns the current value of the bd variable and after that increases it, whereas the prefix operation works the other way round. The printed values are the same as you’d see if you used a variable of type Int, and you didn’t need to do anything special to support this.

9.2Overloading comparison operators make it easy to check relationships between objects

Just as with arithmetic operators, Kotlin lets you use comparison operators (==, !=, >, <, and so on) with any object, not just with primitive types. Instead of calling equals or compareTo, as in Java, you can use comparison operators directly, which is intuitive and concise. In this section, we’ll look at the conventions used to support these operators.

9.2.1Equality operators: equals ("==")
We touched on the topic of equality in section Object equality: equals(). You saw that using the == operator in Kotlin is translated into a call of the equals method. This is just one more application of the conventions principle we’ve been discussing.

Using the != operator is also translated into a call of equals, with the obvious difference that the result is inverted. Note that unlike all other operators, == and != can be used with nullable operands, because those operators check equality to null under the hood. The comparison a == b checks whether a isn’t null, and, if it’s not, calls a.equals(b) (see 9.4). Otherwise the result is true only if both arguments are null references.

Figure 9.4. An equality check == is transformed into an equals call and a null check.


For the Point class, the implementation of equals is automatically generated by the compiler, because you’ve marked it as a data class (4.3.2 explained the details). But if you did implement it manually, here’s what the code could look like.

Listing 9.7. Implementing the equals method

class Point(val x: Int, val y: Int) {
override fun equals(other: Any?): Boolean { #1 if (other === this) return true #2
if (other !is Point) return false #3 return other.x == x && other.y == y #4
}
}


fun main() {
println(Point(10, 20) == Point(10, 20))
// true
println(Point(10, 20) != Point(5, 5))
// true
println(null == Point(1, 2))
// false
}

You use the identity equals operator (===) to check whether the parameter to equals is the same object as the one on which equals is called. The identity equals operator does exactly the same thing as the == operator in Java: it checks that both of its arguments reference the same object (or have the same value, if they have a primitive type). Using this operator is a common optimization when implementing equals. Note that the === operator can’t be overloaded.

The equals function is marked as override, because, unlike other conventions, the method implementing it is defined in the Any class (equality comparison is supported for all objects in Kotlin). That also explains why you don’t need to mark it as operator: the base method in Any is marked as such, and the operator modifier on a method applies also to all methods that implement or override it. Also note that equals can’t be implemented as an extension, because the implementation inherited from the Any class would always take precedence over the extension.

This example shows that using the != operator is also translated into a call of the equals method. The compiler automatically negates the return value, so you don’t need to do anything for this to work correctly.

What about other comparison operators?

9.2.2Ordering operators: compareTo ("<", ">", "⇐" and ">=")

In Java, classes can implement the Comparable interface in order to be used in algorithms that compare values, such as finding a maximum or sorting.
The compareTo method defined in that interface is used to determine whether

one object is larger than another. But in Java, there’s no shorthand syntax for calling this method. Only values of primitive types can be compared using < and >; all other types require you to write element1.compareTo(element2) explicitly.

Kotlin supports the same Comparable interface. But the compareTo method defined in that interface can be called by convention, and uses of comparison operators (<, >, ⇐, and >=) are translated into calls of compareTo, as shown in
9.5. The return type of compareTo has to be Int. The expression p1 < p2 is equivalent to p1.compareTo(p2) < 0. Other comparison operators work exactly the same way.

Figure 9.5. Comparison of two objects is transformed into comparing the result of the compareTo
call with zero.



Because there’s no obviously right way to compare two-dimensional points with one another, let’s use the good-old Person class to show how the method can be implemented. The implementation will use address book ordering (compare by last name, and then, if the last name is the same, compare by first name).

Listing 9.8. Implementing the compareTo method

class Person(
val firstName: String, val lastName: String
) : Comparable<Person> {

override fun compareTo(other: Person): Int { return compareValuesBy(this, other, #1
Person::lastName, Person::firstName)
}
}

fun main() {
val p1 = Person("Alice", "Smith") val p2 = Person("Bob", "Johnson") println(p1 < p2)
// false

}

In this case, you implement the Comparable interface so that the Person objects can be compared not only by Kotlin code but also by Java functions, such as the functions used to sort collections. Just as with equals, the operator modifier is applied to the function in the base interface, so you don’t need to repeat the keyword when you override the function.

Note how you can use the compareValuesBy function from the Kotlin standard library to implement the compareTo method easily and concisely. This function receives a list of selector functions that calculate values to be compared. The function calls each selector in order for both objects and compares the return values. If the values are different, it returns the result of the comparison. If they’re the same, it proceeds to the next selector function, or returns 0 if there are no more functions to call. These selectors can be passed as lambdas or, as you do here, as property references.

Note, however, that a direct implementation comparing fields by hand would be faster, although it would contain more code. As always, you should prefer the concise version and worry about performance only if you know the implementation will be called frequently.

All Java classes that implement the Comparable interface can be compared in Kotlin using the concise operator syntax:

fun main() {
println("abc" < "bac")
// true
}

You don’t need to add any extensions to make that work.

9.3Conventions used for collections and ranges
Some of the most common operations for working with collections are getting and setting elements by index, as well as checking whether an element belongs to a collection. All of these operations are supported via operator syntax: To get or set an element by index, you use the syntax a[b]

(called the indexed access operator). The in operator can be used to check whether an element is in a collection or range and also to iterate over a collection. You can add those operations for your own classes that act as collections. Let’s now look at the conventions used to support those operations.

9.3.1Accessing elements by index: the "get" and "set" conventions
You already know that in Kotlin, you can access the elements in a map similarly to how you access arrays in Java—via square brackets:

val value = map[key]

You can use the same operator to change the value for a key in a mutable map:

mutableMap[key] = newValue

Now it’s time to see how this works. In Kotlin, the indexed access operator is one more convention. Reading an element using the indexed access operator is translated into a call of the get operator method, and writing an element becomes a call to set. The methods are already defined for the Map and MutableMap interfaces. Let’s see how to add similar methods to your own class.

You’ll allow the use of square brackets to reference the coordinates of the point: p[0] to access the X coordinate and p[1] to access the Y coordinate. Here’s how to implement and use it.

Listing 9.9. Implementing the get convention

operator fun Point.get(index: Int): Int { #1 return when(index) {
0 -> x #2
1 -> y
else ->
throw IndexOutOfBoundsException("Invalid coordinate $
}
}


fun main() {
val p = Point(10, 20) println(p[1])
// 20
}

All you need to do is define a function named get and mark it as operator. Once you do that, expressions like p[1], where p has type Point, will be translated into calls to the get method, as shown in 9.6.

Figure 9.6. Access via square brackets is transformed into a get function call.


Note that the parameter of get can be any type, not just Int. For example, when you use the indexing operator on a map, the parameter type is the key type of the map, which can be an arbitrary type. You can also define a get method with multiple parameters. For example, if you’re implementing a class to represent a two-dimensional array or matrix, you can define a method such as operator fun get(rowIndex: Int, colIndex: Int) and call it as matrix[row, col]. You can define multiple overloaded get methods with different parameter types, if your collection can be accessed with different key types.

In a similar way, you can define a function that lets you change the value at a given index using the bracket syntax. The Point class is immutable, so it doesn’t make sense to define such a method for Point. Let’s define another class to represent a mutable point and use that as an example.

Listing 9.10. Implementing the set convention

data class MutablePoint(var x: Int, var y: Int)

operator fun MutablePoint.set(index: Int, value: Int) { #1 when(index) {
0-> x = value #2
1-> y = value else ->
throw IndexOutOfBoundsException("Invalid coordinate $

}
}

fun main() {
val p = MutablePoint(10, 20) p[1] = 42
println(p)
// MutablePoint(x=10, y=42)
}

Figure 9.7. Assignment through square brackets is transformed into a set function call.


This example is also simple: to allow the use of the indexed access operator in assignments, you just need to define a function named set. The last parameter to set receives the value used on the right side of the assignment, and the other arguments are taken from the indices used inside the brackets, as you can see in 9.7.

9.3.2Checking whether an object belongs to a collection: the "in" convention
One other operator supported by collections is the in operator, which is used to check whether an object belongs to a collection. The corresponding function is called contains. Let’s implement it so that you can use the in operator to check whether a point belongs to a rectangle.

Listing 9.11. Implementing the in convention
data class Rectangle(val upperLeft: Point, val lowerRight: Point) operator fun Rectangle.contains(p: Point): Boolean {
return p.x in upperLeft.x until lowerRight.x && #1
p.y in upperLeft.y until lowerRight.y #2
}

fun main() {
val rect = Rectangle(Point(10, 20), Point(50, 50)) println(Point(20, 30) in rect)

// true
println(Point(5, 5) in rect)
// false
}

The object on the right side of in becomes the object on which the contains method is called, and the object on the left side becomes the argument passed to the method (see 9.8).

In the implementation of Rectangle.contains, you use the until standard library function to build an open range and then you use the in operator on a range to check that a point belongs to it.

Figure 9.8. The in operator is transformed into a contains function call.


An open range is a range that doesn’t include its ending point. For example, if you build a regular (closed) range using 10..20, this range includes all numbers from 10 to 20, including 20. An open range 10 until 20 includes numbers from 10 to 19 but doesn’t include 20. A rectangle class is usually defined in such a way that its bottom and right coordinates aren’t part of the rectangle, so the use of open ranges is appropriate here.

9.3.3Creating ranges from objects: The "rangeTo" convention
To create a range, you use the .. syntax: for instance, 1..10 enumerates all the numbers from 1 to 10. You met ranges in 2.4.4, but now let’s discuss the convention that helps create one. The .. operator is a concise way to call the rangeTo function (see 9.9).

Figure 9.9. The .. operator is transformed into a rangeTo function call.


The rangeTo function returns a range. You can define this operator for your

own class. But if your class implements the Comparable interface, you don’t need that: you can create a range of any comparable elements by means of the Kotlin standard library. The library defines the rangeTo function that can be called on any comparable element:

operator fun <T: Comparable<T>> T.rangeTo(that: T): ClosedRange<T

This function returns a range that allows you to check whether different elements belong to it.

As an example, let’s build a range of dates using the LocalDate class (defined in the Java 8 standard library).

Listing 9.12. Working with a range of dates
import java.time.LocalDate fun main() {
val now = LocalDate.now()
val vacation = now..now.plusDays(10) #1 println(now.plusWeeks(1) in vacation) #2
// true
}

The expression now..now.plusDays(10) is transformed into now.rangeTo(now.plusDays(10)) by the compiler. The rangeTo function isn’t a member of LocalDate but rather is an extension function on Comparable, as shown earlier.
The rangeTo operator has lower priority than arithmetic operators. But it’s better to use parentheses for its arguments to avoid confusion:

fun main() {
val n = 9 println(0..(n + 1)) #1
// 0..10
}

Also note that the expression 0..n.forEach {} won’t compile, because you have to surround a range expression with parentheses to call a method on it:

fun main() {
(0..n).forEach { print(it) } #1
// 0123456789
}

Now let’s discuss how conventions allow you to iterate over a collection or a range.

9.3.4Making it possible to loop over your types: The "iterator" convention
As we discussed in chapter 2, for loops in Kotlin use the same in operator as range checks. But its meaning is different in this context: it’s used to perform iteration. This means a statement such as for (x in list) { … } will be translated into a call of list.iterator(), on which the hasNext and next methods are then repeatedly called, just like in Java.

Note that in Kotlin, it’s also a convention, which means the iterator method can be defined as an extension. That explains why it’s possible to iterate over a regular string: the Kotlin standard library defines an extension function iterator on CharSequence, a superclass of String:
operator fun CharSequence.iterator(): CharIterator #1 fun main() {
for (c in "abc") { }
}

You can define the iterator function as a method in your own classes, or as an extension function for third-party classes that you are using. For example, you could define an extension function that makes it possible to iterate over LocalDate objects. Because the iterator function should return an object implementing the Iterator<LocalDate> interface, you use an object declaration (as you’ve gotten to know it in 4.4.1) to specify implementations for the hasNext and next functions expected by the interface:

Listing 9.13. Implementing a date range iterator

import java.time.LocalDate

operator fun ClosedRange<LocalDate>.iterator(): Iterator<LocalDat object : Iterator<LocalDate> { #1
var current = start

override fun hasNext() = current <= endInclusive #2

override fun next(): LocalDate { val thisDate = current
current = current.plusDays(1) #3 return thisDate #4
}
}

fun main() {
val newYear = LocalDate.ofYearDay(2042, 1) val daysOff = newYear.minusDays(1)..newYear for (dayOff in daysOff) { println(dayOff) } #5
// 2041-12-31
// 2042-01-01
}

Note how you define the iterator method on a custom range type: you use LocalDate as a type argument. The rangeTo library function, shown in the previous section, returns an instance of ClosedRange, and the iterator extension on ClosedRange<LocalDate> allows you to use an instance of the range in a for loop.

9.4Making destructuring declarations possible with component functions
When we discussed data classes in 4.3.2, we mentioned that some of their features would be revealed later. Now that you’re familiar with the principle of conventions, we can look at the final feature: destructuring declarations. This feature allows you to unpack a single composite value and use it to initialize several separate local variables.

Here’s how it works:

fun main() {
val p = Point(10, 20) val (x, y) = p #1

println(x)
// 10 println(y)
// 20
}

A destructuring declaration looks like a regular variable declaration, but it has multiple variables grouped in parentheses.

Under the hood, the destructuring declaration once again uses the principle of conventions. To initialize each variable in a destructuring declaration, a function named componentN is called, where N is the position of the variable in the declaration. In other words, the previous example would be transformed as shown in 9.10.

Figure 9.10. Destructuring declarations are transformed into componentN function calls.


For a data class, the compiler generates a componentN function for every property declared in the primary constructor. The following example shows how you can declare these functions manually for a non-data class:
class Point(val x: Int, val y: Int) { operator fun component1() = x operator fun component2() = y
}

One of the main use cases where destructuring declarations are helpful is returning multiple values from a function. If you need to do that, you can define a data class to hold the values you need to return and use it as the return type of the function. The destructuring declaration syntax makes it easy to unpack and use the values after you call the function. To demonstrate, let’s write a simple function to split a filename into a name and an extension.

Listing 9.14. Using a destructuring declaration to return multiple values

data class NameComponents(val name: String, #1
val extension: String)

fun splitFilename(fullName: String): NameComponents { val result = fullName.split('.', limit = 2) return NameComponents(result[0], result[1]) #2
}

fun main() {
val (name, ext) = splitFilename("example.kt") #3 println(name)
// example println(ext)
// kt
}

You can improve this example even further if you note that componentN functions are also defined on arrays and collections. This is useful when you’re dealing with collections of a known size—and this is such a case, with split returning a list of two elements.

Listing 9.15. Using a destructuring declaration with a collection

data class NameComponents(
val name: String,
val extension: String)

fun splitFilename(fullName: String): NameComponents {
val (name, extension) = fullName.split('.', limit = 2) return NameComponents(name, extension)
}

Of course, it’s not possible to define an infinite number of such componentN functions so the syntax would work with an arbitrary number of items, but that wouldn’t be useful, either. The standard library allows you to use this syntax to access the first five elements of a container.

A simpler way to return multiple values from a function is to use the Pair and Triple classes from the standard library. While this may require less code than defining your own class, you’re also giving up valuable expressiveness in your code, because Pair and Triple don’t make it clear what is contained in the returned object.

9.4.1Destructuring declarations and loops

Destructuring declarations work not only as top-level statements in functions but also in other places where you can declare variables—for example, in loops. One good use for that is enumerating entries in a map. Here’s a small example using this syntax to print all entries in a given map.

Listing 9.16. Using a destructuring declaration to iterate over a map

fun printEntries(map: Map<String, String>) { for ((key, value) in map) { #1
println("$key -> $value")
}
}

fun main() {
val map = mapOf("Oracle" to "Java", "JetBrains" to "Kotlin") printEntries(map)
// Oracle -> Java
// JetBrains -> Kotlin
}

This simple example uses two Kotlin conventions: one to iterate over an object and another to destructure declarations. The Kotlin standard library contains an extension function iterator on a map that returns an iterator over map entries. Thus, unlike Java, you can iterate over a map directly. It also contains extensions functions component1 and component2 on Map.Entry, returning its key and value, respectively. In effect, the previous loop is translated to the equivalent of the following code:

for (entry in map.entries) { val key = entry.component1()
val value = entry.component2()
// ...
}

You can also use destructuring declarations when a lambda receives a composite value like a data class or a map. In this example, you are yet again printing all entries in a given map, but use the .forEach function which you already got to know in 5.1.4:

map.forEach { (key, value) -> println("$key -> $value")
}

These examples again illustrate the importance of extension functions to support Kotlin’s conventions.

9.4.2Ignoring destructured values with "_"
When you’re destructuring an object with many components, there’s a change you might not actually need all of them. In this example, you’re destructuring a Person class, but really only use the firstName and age fields:

Listing 9.17. Intro person

data class Person(
val firstName: String, val lastName: String, val age: Int,
val city: String,
)

fun introducePerson(p: Person) {
val (firstName, lastName, age, city) = p println("This is $firstName, aged $age.")
}

In this case, declaring a local lastName and city variable doesn’t provide any value for our code. Rather, it clutters the body of the function with unused variables—something that is generally best avoided.

Since we’re not forced to destructure the whole object, we can leave trailing destructuring declarations (in this case, city) out of the destructuring declaration. Instead, you only destructure the first three elements:

val (firstName, lastName, age) = p

To get rid of the lastName declaration, you have to take a slightly different route. Were we to just remove it (leaving us with (firstName, age)), we would falsely assign the contents of Person.lastName to the age variable

(remember that under the hood, this destructuring declaration only calls the component1 and component2 functions, regardless of the name you give them). To deal with this case, Kotlin allows you to assign unused declarations during destructuring by assigning them to the reserved _ character.
Equipped with this knowledge, you can make the implementation for introducePerson more concise—renaming lastName to _, and removing city during the destructuring entirely:
fun introducePerson(p: Person) { val (firstName, _, age) = p #1
println("This is $firstName, aged $age.")
}

Limitations and drawbacks of destructuring in Kotlin

Kotlin’s implementation of destructuring declarations is positional—that means, the result of a desturcturing operation depends entirely on the positions of the arguments. For the Person data class from 9.17, this means that variables during destructuring will always be assigned the values in the same order as they appear in the constructor:

val (firstName, lastName, age, city) = p

The names of the variables to which the result of the destructuring is assigned do not matter—because destructuring declarations iterates through the componentN functions one after the other, this code works just as well:
val (f, l, a, c) = p

This can lead to subtle problems when during refactoring, you change the order of properties in a data class:

data class Person(
val lastName: String, #1 val firstName: String, #1 val age: Int,
val city: String,
)

Now, the same code snippet from above still works, but falsely assigns the

value of lastName to firstName, and vice versa:
val (firstName, lastName, age, city) = p

This behavior means destructuring declarations are best only used for small container classes (such as key-value pairs or index-value pairs), or classes that are very unlikely to change in the future. They should be avoided for more complex entities.

A potential solution to this issue is the introduction of name-based destructuring, a topic that at the time of writing is being considered for Kotlin’s value classes (http://mng.bz/v17r), which are planned to be added in a future version of Kotlin.

9.5Reusing property accessor logic: delegated properties
To conclude this chapter, let’s look at one more feature that relies on conventions and is one of the most unique and powerful in Kotlin: delegated properties. This feature lets you easily implement properties that work in a more complex way than storing values in backing fields, without duplicating the logic in each accessor. For example, properties can store their values in database tables, in a browser session, in a map, and so on.

The foundation for this feature is delegation: a design pattern where an object, instead of performing a task, delegates that task to another helper object. The helper object is called a delegate. You saw this pattern earlier, in 4.3.3, when we were discussing class delegation. Here this pattern is applied to a property, which can also delegate the logic of its accessors to a helper object. You could implement that by hand—or use a better solution: take advantage of Kotlin’s language support. You’ll see examples for both in a moment, but first, let’s have a look at a general explanation.

9.5.1Basic syntax and inner workings of delegated properties
The general syntax of a delegated property is this:

var p: Type by Delegate()

The property p delegates the logic of its accessors to another object: in this case, a new instance of the Delegate class. The object is obtained by evaluating the expression following the by keyword, which can be anything that satisfies the rules of the convention for property delegates.

Let’s take a look at what happens under the hood for a class that defines a delegated property, such as this:

class Foo {
var p: Type by Delegate()
}

The compiler creates a hidden helper property, initialized with the instance of the delegate object, to which the initial property p delegates. For simplicity, let’s call it delegate:
class Foo {
private val delegate = Delegate() #1

var p: Type #2
set(value: Type) = delegate.setValue(..., value) get() = delegate.getValue(...)
}

By convention, the Delegate class must have getValue and setValue operator functions, although the latter is required only for mutable properties (i.e. when defining var delegate = …). Additionally, they can (but don’t have to) also provide an implementation for the provideDelegate function, in which you can perform validation logic or change the way the delegate is instantiated when it is first created. As usual, they can be implemented as members or extensions. To simplify the explanation, we omit their parameters; the exact signatures will be covered later in this chapter. In a simple form, the Delegate class might look like the following:
class Delegate {
operator fun getValue(...) { ... } #1

operator fun setValue(..., value: Type) { ... } #2 operator fun provideDelegate(...): Delegate { ... } #3

}


class Foo {
var p: Type by Delegate() #4
}

fun main() {
val foo = Foo() #5
val oldValue = foo.p #6 foo.p = newValue #7
}

You use foo.p as a regular property, but under the hood the methods on the helper property of the Delegate type are called. To investigate how this mechanism is used in practice, we’ll begin by looking at one example of the power of delegated properties: library support for lazy initialization.
Afterward, we’ll explore how you can define your own delegated properties and when this is useful.

9.5.2Using delegated properties: lazy initialization and "by lazy()"
Lazy initialization is a common pattern that entails creating part of an object on demand, when it’s accessed for the first time. This is helpful when the initialization process consumes significant resources and the data isn’t always required when the object is used.

For example, consider a Person class that lets you access a list of the emails written by a person. The emails are stored in a database and take a long time to access. You want to load the emails on first access to the property and do so only once. Let’s say you have the following function loadEmails, which retrieves the emails from the database:

class Email { /*...*/ }
fun loadEmails(person: Person): List<Email> { println("Load emails for ${person.name}") return listOf(/*...*/)
}

Here’s how you can implement lazy loading using an additional _emails

property that stores null before anything is loaded and the list of emails afterward. The emails property itself uses a custom accessor as you got to know them in 2.2.2:

Listing 9.18. Implementing lazy initialization using a backing property

class Person(val name: String) {
private var _emails: List<Email>? = null #1

val emails: List<Email> get() {
if (_emails == null) {
_emails = loadEmails(this) #2
}
return _emails!! #3
}
}

fun main() {
val p = Person("Alice") p.emails #4
// Load emails for Alice p.emails
}

Here you use the so-called backing property technique. You have one property, _emails, which stores the value, and another, emails, which provides read access to it. You need to use two properties because the properties have different types: _emails is nullable, whereas emails is non- null. Their naming follows a simple convention: When your class has two properties representing the same concept, the private property is prefixed with an underscore (_emails), while the public property has no prefix (emails).
This technique can be used fairly often, so it’s worth getting familiar with it.

But the code is somewhat cumbersome: imagine how much longer it would become if you had several lazy properties. What’s more, it doesn’t always work correctly: the implementation isn’t thread-safe. If two threads both access the emails property, there’s no mechanism in place to prevent the expensive loadEmails function from being called twice. At best, this only

wastes some resources, but at worst, you end up with an inconsistent state in your application. Surely Kotlin provides a better solution.

The code becomes much simpler with the use of a delegated property, which can encapsulate both the backing property used to store the value and the logic ensuring that the value is initialized only once. The delegate you can use here is returned by the lazy standard library function.

Listing 9.19. Implementing lazy initialization using a delegated property

class Person(val name: String) {
val emails by lazy { loadEmails(this) }
}

The lazy function returns an object that has a method called getValue with the proper signature, so you can use it together with the by keyword to create a delegated property. The argument of lazy is a lambda that it calls to initialize the value. The lazy function is thread-safe by default; and if you need to, you can specify additional options to tell it which lock to use or to bypass the synchronization entirely if the class is never used in a multithreaded environment.

In the next section, we’ll dive into details of how the mechanism of delegated properties works and discuss the conventions in play here.

9.5.3Implementing your own delegated properties
To see how delegated properties are implemented, let’s take another example: the task of notifying listeners when a property of an object changes. This is useful in many different cases: for example, when objects are presented in a UI and you want to automatically update the UI when the objects change.

This is typically called an "observable". Let’s see how we could implement it in Kotlin. First, let’s look at a variant that doesn’t use delegated properties.
Then, let’s refactor the code to using delegated properties.

The Observable class manages a list of Observers. When notifyObservers
is called, it calls the onChange function for each Observer with the old and

new property values. An Observer only needs to provide an implementation for this onChange method, so it would be suitable to use a functional interface as you’ve seen them in 5.3:

fun interface Observer {
fun onChange(name: String, oldValue: Any?, newValue: Any?)
}

open class Observable {
val observers = mutableListOf<Observer>()
fun notifyObservers(propName: String, oldValue: Any?, newValu for (obs in observers) {
obs.onChange(propName, oldValue, newValue)
}
}
}

Now let’s write a Person class. You’ll define a read-only property (the person’s name, which typically doesn’t change) and two writable properties: the age and the salary. The class will notify its observers when either the age or the salary of the person is changed.

Listing 9.20. Implementing observer notifications for changed properties manually

class Person(val name: String, age: Int, salary: Int): Observable var age: Int = age
set(newValue) {
val oldValue = field #1 field = newValue notifyObservers( #2
"age", oldValue, newValue
)
}

var salary: Int = salary set(newValue) {
val oldValue = field field = newValue notifyObservers(
"salary", oldValue, newValue
)
}
}

fun main() {

val p = Person("Seb", 28, 1000)
p.observers += Observer { propName, oldValue, newValue -> #3 println(
"""
Property $propName changed from $oldValue to $newValu """.trimIndent()
)
}
p.age = 29
// Property age changed from 28 to 29! p.salary = 1500
// Property salary changed from 1000 to 1500!
}

Note how this code uses the field identifier to access the backing field of the
age and salary properties, as we discussed in 4.2.4.
There’s quite a bit of repeated code in the setters. Let’s try to extract a class that will store the value of the property and fire the necessary notification.

Listing 9.21. Implementing observer notifications for changed properties with a helper class

class ObservableProperty(val propName: String, var propValue: Int fun getValue(): Int = propValue
fun setValue(newValue: Int) { val oldValue = propValue propValue = newValue
observable.notifyObservers(propName, oldValue, newValue)
}
}

class Person(val name: String, age: Int, salary: Int): Observable val _age = ObservableProperty("age", age, this)
var age: Int
get() = _age.getValue() set(newValue) {
_age.setValue(newValue)
}

val _salary = ObservableProperty("salary", age, this) var salary: Int
get() = _salary.getValue() set(newValue) {
_salary.setValue(newValue)
}

}

Now you’re close to understanding how delegated properties work in Kotlin. You’ve created a class that stores the value of the property and automatically notifies observers when it’s modified. You removed the duplication in the logic, but instead quite a bit of boilerplate is required to create the ObservableProperty instance for each property and to delegate the getter and setter to it. Kotlin’s delegated property feature lets you get rid of that boilerplate. But before you can do that, you need to change the signatures of the ObservableProperty methods to match those required by Kotlin conventions.

Listing 9.22. ObservableProperty as a property delegate

import kotlin.reflect.KProperty

class ObservableProperty(var propValue: Int, val observable: Obse operator fun getValue(thisRef: Any?, prop: KProperty<*>): Int =

operator fun setValue(thisRef: Any?, prop: KProperty<*>, newVal val oldValue = propValue
propValue = newValue observable.notifyObservers(prop.name, oldValue, newValue)
}
}

Compared to the previous version, this code has the following changes:

The getValue and setValue functions are now marked as operator, as required for all functions used through conventions.
You add two parameters to those functions: one to receive the instance for which the property is get or set (thisRef), and the second to represent the property itself (prop). The property is represented as an object of type KProperty. We’ll look at it in more detail in Chapter 12; for now, all you need to know is that you can access the name of the property as KProperty.name.
You remove the name property from the primary constructor because you can now access the property name through KProperty.
You can finally use the magic of Kotlin’s delegated properties. See how

much shorter the code becomes?

Listing 9.23. Using delegated properties for making properties observable

class Person(val name: String, age: Int, salary: Int) : Observabl var age by ObservableProperty(age, this)
var salary by ObservableProperty(salary, this)
}

Through the by keyword, the Kotlin compiler does automatically what you did manually in the previous version of the code. Compare this code to the previous version of the Person class: the generated code when you use delegated properties is very similar. The object to the right of by is called the delegate. Kotlin automatically stores the delegate in a hidden property and calls getValue and setValue on the delegate when you access or modify the main property.

Instead of implementing the observable property logic by hand, you can use the Kotlin standard library. It turns out the standard library already contains has its own ObservableProperty class. However, the standard library class doesn’t know anything about the Observable interface that you defined yourself earlier, so you need to pass it a lambda that tells it how to report the changes in the property value. Here’s how you can do that.

Listing 9.24. Using Delegates.observable to implement property change notification

import kotlin.properties.Delegates

class Person(val name: String, age: Int, salary: Int) : Observabl private val onChange = { property: KProperty<*>, oldValue: An
notifyObservers(property.name, oldValue, newValue)
}

var age by Delegates.observable(age, onChange)
var salary by Delegates.observable(salary, onChange)
}

The expression to the right of by doesn’t have to be a new instance creation. It can also be a function call, another property, or any other expression, as long as the value of this expression is an object on which the compiler can call getValue and setValue with the correct parameter types. As with other

conventions, getValue and setValue can be either methods declared on the object itself or extension functions.

Note that to keep the examples simple, we’ve only shown you how to work with delegated properties of type Int. The delegated-properties mechanism is fully generic and works with any other type, too.

9.5.4Delegated-property are translated to hidden properties with custom accessors
Let’s summarize the rules for how delegated properties work. Suppose you have a class with a delegated property:

class C {
var prop: Type by MyDelegate()
}

val c = C()

The instance of MyDelegate will be stored in a hidden property, which we’ll refer to as <delegate>. The compiler will also use an object of type KProperty to represent the property. We’ll refer to this object as <property>.
The compiler generates the following code:

class C {
private val <delegate> = MyDelegate()

var prop: Type
get() = <delegate>.getValue(this, <property>)
set(value: Type) = <delegate>.setValue(this, <property>, v
}

Thus, inside every property accessor, the compiler generates calls to the corresponding getValue and setValue methods, as shown in 9.11.

Figure 9.11. When you access a property, the getValue and setValue functions on <delegate> are called.



The mechanism is fairly simple, yet it enables many interesting scenarios. You can customize where the value of the property is stored (in a map, in a database table, or in the cookies of a user session) and also what happens when the property is accessed (to add validation, change notifications, and so on). All of this can be accomplished with compact code. Let’s look at one more use for delegated properties in the standard library and then see how you can use them in your own frameworks.

9.5.5Accessing dynamic attributes by delegating to maps
Another common pattern where delegated properties come into play is objects that have a dynamically defined set of attributes associated with them. (Other languages, such as C#, call such objects expando objects.) For example, consider a contact-management system that allows you to store arbitrary information about your contacts. Each person in the system has a few required properties (such as a name) that are handled in a special way, as well as any number of additional attributes that can be different for each person (youngest child’s birthday, for example).

One way to implement such a system is to store all the attributes of a person in a map and provide properties for accessing the information that requires special handling. Here’s an example.

Listing 9.25. Defining a property that stores its value in a map

class Person {
private val _attributes = mutableMapOf<String, String>()

fun setAttribute(attrName: String, value: String) {
_attributes[attrName] = value
}

var name: String

get() = _attributes["name"]!! #1 set(value) {
_attributes["name"] = value #2
}
}

fun main() {
val p = Person()
val data = mapOf("name" to "Seb", "company" to "JetBrains") for ((attrName, value) in data)
p.setAttribute(attrName, value) println(p.name)
// Seb
p.name = "Sebastian" println(p.name)
// Sebastian
}

Here you use a generic API to load the data into the object (in a real project, this could be JSON deserialization or something similar) and then a specific API to access the value of one property. Changing this to use a delegated property is trivial; you can put the map directly after the by keyword.

Listing 9.26. Using a delegated property which stores its value in a map

class Person {
private val _attributes = mutableMapOf<String, String>()

fun setAttribute(attrName: String, value: String) {
_attributes[attrName] = value
}

var name: String by _attributes #1
}

This works because the standard library defines getValue and setValue extension functions on the standard Map and MutableMap interfaces. The name of the property is automatically used as the key to store the value in the map. As in 9.25, p.name hides the call of _attributes.getValue(p, prop), which in turn is implemented as _attributes[prop.name].

9.5.6How a real-life framework might use delegated properties

Changing the way the properties of an object are stored and modified is extremely useful for framework developers. This section shows a an example case of how delegated properties improves framework development and usage, and dives into the details of it works.

Let’s say your database contains the table Users with two columns: name of string type and age of integer type. You can define the classes Users and User in Kotlin. Then all the user entities stored in the database can be loaded and changed in Kotlin code via instances of the User class.

Listing 9.27. Accessing database columns using delegated properties

object Users : IdTable() { #1
val name = varchar("name", length = 50).index() #2 val age = integer("age")
}

class User(id: EntityID) : Entity(id) { #3 var name: String by Users.name #4
var age: Int by Users.age
}

The Users object describes a database table; it’s declared as an object because it describes the table as a whole, so you only need one instance of it. Properties of the object represent columns of the table.

The Entity class, the superclass of User, contains a mapping of database columns to their values for the entity. The properties for the specific User have the values name and age specified in the database for this user.
Using the framework is especially convenient because accessing the property automatically retrieves the corresponding value from the mapping in the Entity class, and modifying it marks the object as dirty so that it can be saved to the database when needed. You can write user.age += 1 in your Kotlin code, and the corresponding entity in the database will be automatically updated.

Now you know enough to understand how a framework with such an API can be implemented. Each of the entity attributes (name, age) is implemented as a delegated property, using the column object (Users.name, Users.age) as the

delegate:

class User(id: EntityID) : Entity(id) { var name: String by Users.name #1 var age: Int by Users.age
}

Let’s look at the explicitly specified types of columns:

object Users : IdTable() {
val name: Column<String> = varchar("name", 50).index() val age: Column<Int> = integer("age")
}

For the Column class, the framework defines the getValue and setValue
methods, satisfying the Kotlin convention for delegates:

operator fun <T> Column<T>.getValue(o: Entity, desc: KProperty<*>
{
// retrieve the value from the database
}
operator fun <T> Column<T>.setValue(o: Entity, desc: KProperty<*>
{
// update the value in the database
}

You can use the Column property (Users.name) as a delegate for a delegated property (name). When you write user.age += 1 in your code, the code will perform something similar to user.ageDelegate.setValue(user.ageDelegate.getValue() + 1) (omitting the parameters for the property and object instances). The getValue and setValue methods take care of retrieving and updating the information in the database.

The full implementation of the classes in this example can be found in the source code for the Exposed framework (https://github.com/JetBrains/Exposed). We’ll return to this framework in Chapter 13, to explore the DSL design techniques used there.

9.6Summary

Kotlin allows you to overload some of the standard mathematical operations by defining functions with the corresponding names. You can’t define your own operators, but you can use infix functions as a more expressive alternative.
You can use comparison operators (==, !=, >, <, and so on) with any object. They are mapped to calls of the equals and compareTo methods. By defining functions named get, set, and contains, you can support the [] and in operators to make your class similar to Kotlin collections. Creating ranges and iterating over collections and arrays also work through conventions.
Destructuring declarations let you initialize multiple variables by unpacking a single object, which is handy for returning multiple values from a function. They work with data classes automatically, and you can support them for your own classes by defining functions named componentN.
Delegated properties allow you to reuse logic controlling how property values are stored, initialized, accessed, and modified, which is a powerful tool for building frameworks.
The lazy standard library function provides an easy way to implement lazily initialized properties.
The Delegates.observable function lets you add an observer of property changes.
Delegated properties can use any map as a property delegate, providing a flexible way to work with objects that have variable sets of attributes.
