# 12 Annotations and reflection

::: tip This chapter covers

1. Applying and defining annotations
2. Using reflection to introspect classes at runtime
3. A real example of a Kotlin project

:::

Up to this point, you’ve seen many features for working with classes and functions, but they all require you to specify the exact names of classes and functions you’re using as part of the program source code. In order to call a function, you need to know the class in which it was defined, as well as its name and parameter types. Annotations and reflection give you the power to go beyond that and to write code that deals with arbitrary classes that aren’t known in advance. You can use annotations to assign library-specific semantics to those classes; and reflection allows you to analyze the structure of the classes at runtime.

Applying annotations is straightforward. But writing your own annotations, and especially writing the code that handles them, is less trivial. The syntax for using annotations is exactly the same as in Java, whereas the syntax for declaring your own annotation classes is a bit different. The general structure of the reflection APIs is also similar to Java, but the details differ.

As a demonstration of the use of annotations and reflection, we’re going to walk you through an implementation of a real-life project: a JSON serialization and deserialization library called JKid. The library uses reflection to access properties of arbitrary Kotlin objects at runtime and also to create objects based on data provided in JSON files. Annotations let you customize how specific classes and properties are serialized and deserialized by the library.

## 12.1 Declaring and applying annotations

Annotations allow you to associate additional metadata with a declaration. The metadata can then be accessed by tools that work with source code, with compiled class files, or at runtime, depending on how the annotation is configured.

### 12.1.1 Applying annotations to mark declarations

In Kotlin, to apply an annotation, you put its name, prefixed with the `@` character, in the beginning of the declaration you’re annotating. You can annotate different code elements, such as functions and classes.

For instance, if you’re using the `kotlin.test` library together with the JUnit framework (https://junit.org/junit5/), you can mark a test method with the `@Test` annotation:

```kotlin
import kotlin.test.*
class MyTest {
    @Test
    fun testTrue() {
        assertTrue(1 + 1 == 2)
    }
}
```

As a more interesting example, let’s look at the `@Deprecated` annotation. It marks a declaration as deprecated, indicating it should no longer be used in code—usually because it has been replaced by a different declaration, or because the functionality it provides is no longer supported.

The `@Deprecated` annotation takes up to three parameters. Firstly, a `message` explains the reason for the deprecation. An optional `replaceWith` parameter lets you provide a replacement pattern to support a smooth transition to a new version of the API. You can also provide a `level` that helps with gradual deprecation—where `WARNING` serves as a mere notification to users of a declaration, `ERROR` and `HIDDEN` prevent new Kotlin code to be compiled against these APIs, with the latter only keeping binary compatibility for previously compiled code.

The following example shows how you can provide arguments for the annotation (specifically, a deprecation message and a replacement pattern). The arguments are passed in parentheses, just as in a regular function call. Here, the `remove` function is annotated to indicate that `removeAt(index)` is the preferred replacement:

```kotlin
@Deprecated("Use removeAt(index) instead.", ReplaceWith("removeAt(index)"))
fun remove(index: Int) { /* ... */ }
```

With this declaration, if someone uses the function `remove`, IntelliJ IDEA will not only show what function should be used instead (`removeAt` in this case), but also offer a quick fix to replace it automatically.

![img_10.png](img/img_10.png)

Annotations can only have parameters of primitive types, strings, enums, class references, other annotation classes, and arrays thereof. The syntax for specifying annotation arguments looks as follows:

- To specify a class as an annotation argument, put `::class` after the class name: `@MyAnnotation(MyClass::class`). For instance, a serialization library (as we will discuss it later in this chapter) may provide an annotation that expects a class as an argument to establish the mapping between interfaces and the implementation used during the deserialization process: `@DeserializeInterface(CompanyImpl::class)`
- To specify another annotation as an argument, don’t put the `@` character before the annotation name. For instance, `ReplaceWith` in the previous example is an annotation, but you don’t use `@` when you specify it as an argument of the `Deprecated` annotation.
- To specify an array as an argument, you can use brackets: `@RequestMapping(path = ["/foo", "/bar"])`. Alternatively, you can also use the `arrayOf` function to specify the array. (If you are using an annotation class that is declared in Java, the parameter named `value` is automatically converted to a vararg parameter if necessary.)

Annotation arguments need to be known at compile time, so you can’t refer to arbitrary properties as arguments. To use a property as an annotation argument, you need to mark it with a `const` modifier, which tells the compiler that the property is a compile-time constant. Here’s an example of JUnit’s `@Timeout` annotation that specifies the timeout for the test in seconds:

```kotlin
const val TEST_TIMEOUT = 10L

class MyTest {
    @Test
    @Timeout(TEST_TIMEOUT)
    fun testMethod() {
        // ...
    }
}
```

As discussed in TOP-LEVEL PROPERTIES, properties annotated with `const` need to be declared at the top level of a file or in an `object` and must be initialized with values of primitive types or `String`. If you try to use a regular property as an annotation argument, you’ll get the error "Only 'const val' can be used in constant expressions."

### 12.1.2 Specifying the exact declaration an annotation refers to: Annotation targets

In many cases, a single declaration in the Kotlin source code corresponds to multiple Java declarations, and each of them can carry annotations. For example, a Kotlin property corresponds to a Java field, a getter, and possibly a setter and its parameter. A property declared in the primary constructor has one more corresponding element: the constructor parameter. Therefore, it may be necessary to specify which of these elements needs to be annotated.

You specify the element to be annotated with a use-site target declaration. The use-site target is placed between the `@` sign and the annotation name and is separated from the name with a colon. The word `get` in 12.2 causes the annotation `@JvmName` to be applied to the property getter.

![img_11.png](img/img_11.png)

If you want to change the way a function or property is accessed from Java, you can use the `@JvmName` annotation that you already briefly saw in 3.2.3. Here, you use it to make the `calculate` function callable from Java code via `performCalculation()`:

```kotlin
@JvmName("performCalculation")
fun calculate(): Int {
    return (2 + 2) - 1
}
```
You can do the same with properties in Kotlin too: As you may remember from 2.2.1, Kotlin properties automatically define a getter and setter. To explicitly apply the `@JvmName` annotation to the getter or setter of a property, use `@get:JvmName()` and `@set:JvmName()` respectively:

```kotlin
class CertificateManager {
    @get:JvmName("obtainCertificate")
    @set:JvmName("putCertificate")
    var certificate: String = "-----BEGIN PRIVATE KEY-----"
}
```
With these annotations in place, Java code can now access the `certificate` property using the renamed `obtainCertificate` and `putCertificate` functions:

```kotlin
class Foo {
    public static void main(String[] args) {
        var certManager = new CertificateManager();
        var cert = certManager.obtainCertificate();
        certManager.putCertificate("-----BEGIN CERTIFICATE-----");
    }
}
```
If the annotation you are using happens to be declared in Java, then it is applied to the corresponding field in Kotlin by default. For annotations defined in Kotlin, you can also declare them so that they can be directly applied to properties.

The full list of supported use-site targets is as follows:

- `property`—Property (Java annotations can’t be applied with this use-site target)
- `field`—Field generated for the property.
- `get`—Property getter.
- `set`—Property setter.
- `receiver`—Receiver parameter of an extension function or property.
- `param`—Constructor parameter.
- `setparam`—Property setter parameter.
- `delegate`—Field storing the delegate instance for a delegated property.
- `file`—Class containing top-level functions and properties declared in the file.

Any annotation with the `file` target needs to be placed at the top level of the file, before the `package` directive. One of the annotations commonly applied to files is `@JvmName`, which changes the name of the corresponding class. 3.2.3 showed you an example: `@file:JvmName("StringFunctions")`.

Kotlin allows you to apply annotations to arbitrary expressions, not only to class and function declarations or types. The most common example is the `@Suppress` annotation, which you can use to suppress a specific compiler warning in the context of the annotated expression. Here’s an example that annotates a local variable declaration to suppress an unchecked cast warning:

```kotlin
fun test(list: List<*>) {
    @Suppress("UNCHECKED_CAST")
    val strings = list as List<String>
    // ...
}
```

::: warning **AUTOMATIC INSERT OF @SUPPRESS IN INTELLIJ IDEA AND ANDROID STUDIO**

Note that IntelliJ IDEA and Android studio offer "Suppress" as a quick-fix when you press Alt-Enter on a compiler warning. Selecting this intention will insert the `@Suppress` annotation for you.

:::


::: info **CONTROLLING THE JAVA API WITH ANNOTATIONS**

Kotlin provides a variety of annotations to control how declarations written in Kotlin are compiled to Java bytecode and exposed to Java callers. Some of those annotations replace the corresponding keywords of the Java language: for example, the `@Volatile` annotation serves as a direct replacement for Java’s `volatile` keyword. Others are used to change how Kotlin’s declarations are visible to Java callers:

- `@JvmName` changes the name of a Java method or field generated from a Kotlin declaration.
- `@JvmStatic` can be applied to methods of an object declaration or a companion object to expose them as `static` Java methods.
- `@JvmOverloads`, mentioned in 3.2.2, instructs the Kotlin compiler to generate overloads for a function or constructor that has default parameter values.
- `@JvmField` can be applied to a property to expose that property as a public Java field with no getters or setters.
- `@JvmRecord` can be applied to a `data class` to declare a Java record class as introduced in `DATA CLASSES AND IMMUTABILITY: THE COPY() METHOD`.

You can find more details on the use of those annotations in their documentation comments and in the Java interop section of the online documentation.

:::

### 12.1.3 Using annotations to customize JSON serialization

One of the classic use cases for annotations is customizing object serialization. Serialization is a process of converting an object to a binary or text representation that can be then stored or sent over the network. The reverse process, deserialization, converts such a representation back to an object. One of the most common formats used for serialization is JSON. There are a number of widely used Kotlin libraries for serializing Kotlin objects to JSON, including `kotlinx.serialization` (https://github.com/Kotlin/kotlinx.serialization) which is developed by the Kotlin team at JetBrains.

Additionally, libraries like `Jackson` (https://github.com/FasterXML/jackson) and `GSON` (https://github.com/google/gson) that serve to turn Java objects into JSON are also fully compatible with Kotlin.

Over the course of this chapter, we’ll discuss the implementation of a pure Kotlin serialization library for this purpose, called JKid. It’s small enough for you to read all of its source code easily, and we encourage you to do that while reading this chapter.

::: info **THE JKID LIBRARY SOURCE CODE AND EXERCISES**

The full implementation is available as part of the book’s source code, as well as online at https://github.com/Kotlin/kotlin-in-action-2e-jkid. To study the library implementation and examples, open the repository as a Gradle project in your IDE. The examples can be found in the project under `src/test/kotlin/examples`. The library isn’t as full-featured or flexible as `kotlinx.serialization` or other libraries, but provides a solid case study for how to perform annotation processing and reflection in Kotlin.

Because we will examine the most significant parts of a whole library, you may find it useful to keep the project open on your computer as you read this chapter. This gives you the opportunity to explore the structure and see how the individual discussed aspects of the JKid fit together.

The JKid project has a series of exercises you can work through after you finish reading the chapter to ensure that you understand the concepts. You can find a description of the exercises in the project’s `README.md` file or read it at the project page on GitHub.

:::

Let’s start with the simplest example to test the library: serializing and deserializing an instance a class representing a `Person`. You pass the instance to the `serialize` function, and it returns a string containing its JSON representation:

```kotlin
data class Person(val name: String, val age: Int)

fun main() {
    val person = Person("Alice", 29)
    println(serialize(person))
    // {"age": 29, "name": "Alice"}
}
```

The JSON representation of an object consists of key/value pairs: pairs of property names and their values for the specific instance, such as `"age": 29`.

To get a Kotlin object back from the JSON representation, you call the `deserialize` function. When you create an instance from JSON data, you must specify the class explicitly as a type argument, because JSON doesn't store object types. In this case, you pass the `Person` class:

```kotlin
fun main() {
    val json = """{"name": "Alice", "age": 29}"""
    println(deserialize<Person>(json))
    // Person(name=Alice, age=29)
}
```

12.3 illustrates the equivalence between an object and its JSON representation. Note that the serialized class can contain not only values of primitive types or strings, as shown on the figure, but also collections and instances of other value object classes.

![img_12.png](img/img_12.png)

You can use annotations to customize the way objects are serialized and deserialized. When serializing an object to JSON, by default, the library tries to serialize all the properties and uses the property names as keys. The annotations allow you to change the defaults. In this section, we’ll discuss two annotations, `@JsonExclude` and `@JsonName`, and you’ll see their implementation later in the chapter:

- The `@JsonExclude` annotation is used to mark a property that should be excluded from serialization and deserialization.
- The `@JsonName` annotation lets you specify that the key in the key/value pair representing the property should be the given string, not the name of the property.

Consider this example, in which you annotate the property `firstName` to change the key used to represent it in JSON. You also annotate the property `age` to exclude it from serialization and deserialization:

```kotlin
data class Person(
    @JsonName("alias") val firstName: String,
    @JsonExclude val age: Int? = null
)
```
Note that you must specify the default value of the property `age`. Otherwise, you wouldn't be able to create a new instance of `Person` during deserialization. 12.4 shows how the representation of an instance of the `Person` class changes.

![img_13.png](img/img_13.png)

With that, you’ve seen most of the features available in JKid: `serialize()`, `deserialize()`, `@JsonName`, and `@JsonExclude`. Now let’s start our investigation of its implementation, starting with the annotation declarations.

### 12.1.4 Creating your own annotation declarations

In this section, you’ll learn how to declare annotations, using the annotations from JKid as an example. The `@JsonExclude` annotation has the simplest form, because it doesn't have any parameters. The syntax looks like a regular class declaration, with the added `annotation` modifier before the `class` keyword:

```kotlin
annotation class JsonExclude
```

Because annotation classes are only used to define the structure of metadata associated with declarations and expressions, they can’t contain any code. Therefore, the compiler prohibits specifying a body for an annotation class.

For annotations that have parameters, the parameters are declared in the primary constructor of the class. You use the regular primary constructor declaration syntax, and mark all parameters as `val` (this is mandatory for parameters of an annotation class):

```kotlin
annotation class JsonName(val name: String)
```

::: info **COMPARISON WITH JAVA ANNOTATIONS**

For comparison, here’s how you would have declared the same annotation in Java:

```kotlin
/* Java */
public @interface JsonName {
    String value();
}
```

Note how the Java annotation has a method called `value`, whereas the Kotlin annotation has a `name` property. In Java, the `value` method is special: when you apply an annotation, you need to provide explicit names for all attributes you’re specifying except `value`.

In Kotlin, on the other hand, applying an annotation is a regular constructor call. You can use the named-argument syntax to make the argument names explicit, only specify the names for some arguments, or omit the argument names entirely. In the case of the `JsonName` annotation, `@JsonName(name = "first_name")` means the same as `@JsonName("first_name")`, because `name` is the first parameter of the `JsonName` constructor. If you need to apply an annotation declared in Java to a Kotlin element, however, you’re required to use the named-argument syntax for all arguments except `value`, which Kotlin also recognizes as special.

:::

Next, let’s discuss how to control annotation usage and how you can apply annotations to other annotations.

### 12.1.5 Meta-annotations: controlling how an annotation is processed

A Kotlin annotation class can itself be annotated. The annotations that can be applied to annotation classes are called meta-annotations. The standard library defines several of them, and they control how the compiler processes annotations. Other frameworks use meta-annotations as well—for example, many dependency-injection libraries use meta-annotations to mark annotations used to identify different injectable objects of the same type.

Of the meta-annotations defined in the standard library, the most common is `@Target`. The declarations of `JsonExclude` and `JsonName` in JKid use it to specify the valid targets for those annotations. Here’s how it’s applied:

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

The `@Target` meta-annotation specifies the types of elements to which the annotation can be applied. If you don’t use it, the annotation will be applicable to all declarations. That wouldn't make sense for JKid, because the library processes only property annotations.

The list of values of the `AnnotationTarget` enum gives the full range of possible targets for an annotation. It includes classes, files, functions, properties, property accessors, types, all expressions, and so on. You can declare multiple targets if you need to: `@Target(AnnotationTarget.CLASS, AnnotationTarget.METHOD)`.

To declare your own meta-annotation, use `ANNOTATION_CLASS` as its target:

```kotlin
@Target(AnnotationTarget.ANNOTATION_CLASS)
annotation class BindingAnnotation

@BindingAnnotation
annotation class MyBinding
```

Note that you can’t use annotations with a `property` target from Java code; to make such an annotation usable from Java, you can add the second target `AnnotationTarget.FIELD`. In this case, the annotation will be applied to properties in Kotlin and to fields in Java.

::: info **THE @RETENTION ANNOTATION**

In Java, may have seen another important meta-annotation, `@Retention`. You can use it to specify whether the annotation you declare will be stored in the `.class` file and whether it will be accessible at runtime through reflection. Java by default retains annotations in `.class` files but doesn't make them accessible at runtime. Most annotations do need to be present at `runtime`, so in Kotlin the default is different: annotations have RUNTIME retention. Therefore, the JKid annotations do not have an explicitly specified retention.

:::

### 12.1.6 Passing classes as annotation parameters to further control behavior

You’ve seen how to define an annotation that holds static data as its arguments, but sometimes you need something different: the ability to refer to a class as declaration metadata. You can do so by declaring an annotation class that has a class reference as a parameter. In the JKid library, this comes up in the `@DeserializeInterface` annotation, which allows you to control the deserialization of properties that have an interface type. You can’t create an instance of an interface directly, so you need to specify which class is used as the implementation created during deserialization.

Here’s a simple example showing how the `@DeserializeInterface` annotation could be used to specify which class should be used to implement the interface:

```kotlin
interface Company {
    val name: String
}

data class CompanyImpl(override val name: String) : Company

data class Person(
    val name: String,
    @DeserializeInterface(CompanyImpl::class) val company: Company
)
```

Upon deserialization, whenever JKid reads a nested `company` object for a `Person` instance, it creates and deserializes an instance of `CompanyImpl` and stores it in the `company` property. To specify this, you use `CompanyImpl::class` as an argument of the `@DeserializeInterface` annotation. In general, to refer to a class, you use its name followed by the `::class` keyword.

Now let’s see how the annotation itself is declared. Its single argument is a class reference, as in `@DeserializeInterface(CompanyImpl::class)`:

```kotlin
annotation class DeserializeInterface(val targetClass: KClass<out Any>)
```

The `KClass` type is used to hold references to Kotlin classes; you’ll see what it lets you do with those classes in 12.2.

The type parameter of `KClass` specifies which Kotlin classes can be referred to by this reference. For instance, `CompanyImpl::class` has a type `KClass<CompanyImpl>`, which is a subtype of the annotation parameter type (see figure 12.5).

If you wrote `KClass<Any>` without the `out` modifier, you wouldn't be able to pass `CompanyImpl::class` as an argument: the only allowed argument would be `Any::class`. The out keyword specifies that you’re allowed to refer to classes that extend `Any`, not just to `Any` itself. The next section shows one more annotation that takes a reference to generic class as a parameter.

![img_14.png](img/img_14.png)

### 12.1.7 Generic classes as annotation parameters

By default, JKid serializes properties of non-primitive types as nested objects. But you can change this behavior and provide your own serialization logic for some values.

The `@CustomSerializer` annotation takes a reference to a custom serializer class as an argument. The serializer class should implement the `ValueSerializer` interface, providing a conversion from a Kotlin object to its JSON representation, and likewise, from a JSON value back to a Kotlin object:

```kotlin
interface ValueSerializer<T> {
    fun toJsonValue(value: T): Any?
    fun fromJsonValue(jsonValue: Any?): T
}
```

Suppose you need to support serialization of dates, and you’ve created your own `DateSerializer` class for that, implementing the `ValueSerializer<Date>` interface. (This class is provided as an example in the JKid source code (http://mng.bz/e1vQ). Here’s how you apply it to the `Person` class:

```kotlin
data class Person(
    val name: String,
    @CustomSerializer(DateSerializer::class) val birthDate: Date
)
```

Now let’s see how the `@CustomSerializer` annotation is declared. The `ValueSerializer` class is generic and defines a type parameter, so you need to provide a type argument value whenever you refer to the type. Because you know nothing about the types of properties with which this annotation will be used, you can use a star projection (discussed in 11.3.6) as the argument:

```kotlin
annotation class CustomSerializer(
    val serializerClass: KClass<out ValueSerializer<*>>
)
```

12.6 examines the type of the `serializerClass` parameter and explains its different parts. You need to ensure that the annotation can only refer to classes that implement the `ValueSerializer` interface. For instance, writing `@CustomSerializer(Date::class)` should be prohibited, because `Date` doesn't implement the `ValueSerializer` interface.

![img_15.png](img/img_15.png)

While this may seem tricky, the good news is that you can apply the same pattern every time you need to use a class as an annotation argument. You can write `KClass<out YourClassName>`, and if `YourClassName` has its own type arguments, replace them with `*`.

You’ve now seen all the important aspects of declaring and applying annotations in Kotlin. The next step is to find out how to access the data stored in the annotations. For this, you need to use reflection.


## 12.2 Reflection: introspecting Kotlin objects at runtime

Reflection is, simply put, a way to access properties and methods of objects dynamically at runtime, without knowing in advance what those properties are. Normally, when you access a method or a property of an object, the source code of your program references a specific declaration, and the compiler statically resolves the reference and ensures that the declaration exists. But sometimes you need to write code that can work with objects of any type, or where the names of methods and properties to be accessed are only known at runtime. A serialization library is a great example of such code: it needs to be able to serialize any object to JSON, so it can’t reference specific classes and properties. This is where reflection comes into play.

When working with reflection in Kotlin, you usually deal with the Kotlin reflection API. It’s defined in the `kotlin.reflect` and `kotlin.reflect.full` packages. It gives you access to all Kotlin concepts, such as data classes, properties, and nullable types. An important note is that the Kotlin reflection API isn’t restricted to Kotlin classes: you can use the same API to access classes written in any JVM language.

As a fallback, you can also use standard Java reflection, as defined in the `java.lang.reflect` package. Because Kotlin classes are compiled to regular Java bytecode, the Java reflection API supports them perfectly well. In particular, this means Java libraries that use the reflection API are fully compatible with Kotlin code.

::: warning NOTE

To reduce the runtime library size on platforms where it matters, such as Android, the Kotlin reflection API is packaged into a separate .jar file, `kotlin-reflect.jar`, which isn’t added to the dependencies of new projects by default. If you’re using the Kotlin reflection API, you need to make sure the library is added as a dependency. The Maven group/artifact ID for the library is `org.jetbrains.kotlin:kotlin-reflect`.

:::

In this section, you’ll see how JKid uses the reflection API. We’ll walk you through the serialization part first, because it’s more straightforward and easier for us to explain, and then proceed to JSON parsing and deserialization. But first let’s take a close look at the contents of the reflection API.

### 12.2.1 The Kotlin reflection API: KClass, KCallable, KFunction, and KProperty

The main entry point of the Kotlin reflection API is `KClass`, which represents a class. You can use it to enumerate and access all the declarations contained in the class, its superclasses, and so on. You get an instance of `KClass` by writing `MyClass::class`. Likewise, to get the class of an object `myObject` at runtime, you write `myObject::class`:

```kotlin
import kotlin.reflect.full.*

class Person(val name: String, val age: Int)

fun main() {
    val person = Person("Alice", 29)
    val kClass = person::class
    println(kClass.simpleName)
    // Person
    kClass.memberProperties.forEach { println(it.name) }
    // age
    // name
}
```
This simple example prints the name of the class and the names of its properties and uses `.memberProperties` to collect all non-extension properties defined in the class, as well as in all of its superclasses.

If you browse the declaration of `KClass`, you’ll see that it contains a bunch of useful methods for accessing the contents of the class:

```kotlin
interface KClass<T : Any> {
    val simpleName: String?
    val qualifiedName: String?
    val members: Collection<KCallable<*>>
    val constructors: Collection<KFunction<T>>
    val nestedClasses: Collection<KClass<*>>
    // ...
}
```
Many other useful features of `KClass`, including `memberProperties` used in the previous example, are declared as extensions. You can see the full list of methods on `KClass` (including extensions) in the standard library reference (http://mng.bz/em4i).

::: warning NOTE

You might expect the `simpleName` and `qualifiedName` properties to be non-nullable. However, recall that you saw in 4.4.4 that you can use `object` expressions to create anonymous objects. While these objects are still an instance of a class, that class is anonymous. As such, it has neither a `simpleName` nor a `qualifiedName`. Accessing those fields from a `KClass` instance will return `null`.

:::

You may have noticed that members, the list of all `members` for a class, is a collection of `KCallable` instances. `KCallable` is a superinterface for functions and properties. It declares the `call` method, which allows you to call the corresponding function or the getter of the property:

```kotlin
interface KCallable<out R> {
    fun call(vararg args: Any?): R
    // ...
}
```

You provide the function arguments in a `vararg` list. The following code demonstrates how you can use `call` to call a function through reflection:

```kotlin
fun foo(x: Int) = println(x)

fun main() {
    val kFunction = ::foo
    kFunction.call(42)
    // 42
}
```

You saw the `::foo` syntax in 5.1.5, and now you can see that the value of this expression is an instance of the `KFunction` class from the reflection API. To call the referenced function, you use the `KCallable.call` method. In this case, you need to provide a single argument, 42. If you try to call the function with an incorrect number of arguments, such as `kFunction.call()`, it will throw a runtime exception: "IllegalArgumentException: Callable expects 1 argument, but 0 were provided."

In this case, however, you can use a more specific method to call the function. The type of the `::foo` expression is `KFunction1<Int, Unit>`, which contains information about parameter and return types. `KFunction1` denotes that this function takes one parameter. To call the function through this interface, you use the `invoke` method. It accepts a fixed number of arguments (1 in this case), and their types correspond to the type parameters of the `KFunction1` interface: The parameter is of type `Int`, and the return type of the function is of type `Unit`. You can also call `kFunction` directly (Chapter 13 will explain the details of why it’s possible to call `kFunction` without an explicit `invoke`.)

```kotlin
import kotlin.reflect.KFunction2

fun sum(x: Int, y: Int) = x + y

fun main() {
    val kFunction: KFunction2<Int, Int, Int> = ::sum
    println(kFunction.invoke(1, 2) + kFunction(3, 4))
    // 10
    kFunction(1)
    // ERROR: No value passed for parameter p2
}
```

Using `invoke` rather than `call` on `kFunction` prevents you from accidentally passing an incorrect number of arguments to the function: the code won’t compile. Therefore, if you have a `KFunction` of a specific type, with known parameters and return type, it’s preferable to use its `invoke` method. The `call` method is a generic approach that works for all types of functions but doesn't provide type safety.

::: info **HOW AND WHERE ARE KFUNCTIONN INTERFACES DEFINED?**

Types such as `KFunction1` represent functions with different numbers of parameters. Each type extends `KFunction` and adds one additional member `invoke` with the appropriate number of parameters. For example, `KFunction2` declares `operator fun invoke(p1: P1, p2: P2): R`, where `P1` and `P2` represent the function parameter types and `R` represents the return type.

These function types are synthetic compiler-generated types, and you won’t find their declarations in the `kotlin.reflect` package. That means you can use an interface for a function with any number of parameters, without artificial restrictions on the possible number of function-type parameters.

:::

You can invoke the `call` method on a `KProperty` instance as well, and it will call the getter of the property. But the property interface gives you a better way to obtain the property value: the `get` method.

To access the `get` method, you need to use the correct interface for the property, depending on how it’s declared. Top-level read-only and mutable properties are represented by instances of the `KProperty0` and `KMutableProperty0` interfaces respectively—both of which have a no-argument `get` method:

```kotlin
var counter = 0

fun main() {
    val kProperty = ::counter
    kProperty.setter.call(21)
    println(kProperty.get())
    // 21
}
```

A member property is represented by an instance of `KProperty1` or `KMutableProperty1`, which both provide a one-argument `get` method. To access its value, you must provide the object instance for which you want to retrieve the value. The following example stores a reference to the property in a `memberProperty` variable; then you call `memberProperty.get(person)` to obtain the value of this property for the specific person instance. So if a memberProperty refers to the age property of the `Person` class, `memberProperty.get(person)` is a way to dynamically get the value of `person.age`:

```kotlin
class Person(val name: String, val age: Int)

fun main() {
    val person = Person("Alice", 29)
    val memberProperty = Person::age
    println(memberProperty.get(person))
    // 29
}
```
Note that `KProperty1` is a generic class. The `memberProperty` variable has the type `KProperty<Person, Int>`, where the first type parameter denotes the type of the receiver and the second type parameter stands for the property type. Thus, you can call its `get` method only with a receiver of the right type; the call `memberProperty.get("Alice")` won’t compile.

Also note that you can only use reflection to access properties defined at the top level or in a class, but not local variables of a function. If you define a local variable `x` and try to get a reference to it using `::x`, you’ll get a compilation error saying that "References to variables aren’t supported yet".

12.7 shows a hierarchy of interfaces that you can use to access source code elements at runtime. Because all declarations can be annotated, the interfaces that represent declaration at runtime, such as `KClass`, `KFunction`, and `KParameter`, all extend `KAnnotatedElement`. `KClass` is used to represent both classes and objects. `KProperty` can represent any property, whereas its subclass, `KMutableProperty`, represents a mutable property, which you declare with `var`. You can use the special interfaces `Getter` and `Setter` declared in `Property` and `KMutableProperty` to work with property accessors as functions—for example, if you need to retrieve their annotations. Both interfaces for accessors extend `KFunction`. For simplicity, we’ve omitted the specific interfaces for properties like `KProperty0` in the figure.

![img_16.png](img/img_16.png)

Now that you’re acquainted with the basics of the Kotlin reflection API, let’s investigate how the JKid library is implemented.

### 12.2.2 Implementing object serialization using reflection

First, let’s recall the declaration of the serialization function in JKid:

```kotlin
fun serialize(obj: Any): String
```

This function takes an object and returns its JSON representation as a string. It’ll build up the resulting JSON in a `StringBuilder` instance. As it serializes object properties and their values, it’ll append them to this `StringBuilder` object. To make the `append` calls more concise, let’s put the implementation in an extension function to `StringBuilder`. That way, you can conveniently call the `append` method without a qualifier:

```kotlin
private fun StringBuilder.serializeObject(x: Any) {
    append(/*...*/)
}
```
Converting a function parameter into an extension function receiver is a common pattern in Kotlin code, and we’ll discuss it in detail in Chapter 13. Note that `serializeObject` doesn't extend the `StringBuilder` API. It performs operations that make no sense outside of this particular context, so it’s marked `private` to ensure that it can’t be used elsewhere. It’s declared as an extension to emphasize a particular object as primary for this code block and to make it easier to work with that object.

Consequently, the `serialize` function delegates all the work to `serializeObject`:

```kotlin
fun serialize(obj: Any): String = buildString { serializeObject(obj) }
```

As you saw in 5.4.1, `buildString` creates a `StringBuilder` and lets you fill it with content in a lambda. In this case, the content is provided by the call to `serializeObject(obj)`.

Now let’s discuss the behavior of the serialization function. By default, it will serialize all properties of the object. Primitive types and strings will be serialized as JSON number, boolean, and string values, as appropriate. Collections will be serialized as JSON arrays. Properties of other types will be serialized as nested objects. As we discussed in the previous section, this behavior can be customized through annotations.

Let’s look at the implementation of `serializeObject`, where you can observe the reflection API in a real scenario.

```kotlin
//Listing 12.1. Serializing an object

private fun StringBuilder.serializeObject(obj: Any) {
    val kClass = obj::class as KClass<Any>
    val properties = kClass.memberProperties

    properties.joinToStringBuilder(
        this, prefix = "{", postfix = "}") { prop ->
        serializeString(prop.name)
        append(": ")
        serializePropertyValue(prop.get(obj))
    }
}
```

The implementation of this function should be clear: you serialize each property of the class, one after another. The resulting JSON will look like this: `{ "prop1": value1, "prop2": value2 }`. The `joinToStringBuilder` function ensures that properties are separated with commas. The `serializeString` function escapes special characters as required by the JSON format. The `serializePropertyValue` function checks whether a value is a primitive value, string, collection, or nested object, and serializes its content accordingly.

In the previous section, we discussed a way to obtain the value of the `KProperty` instance: the `get` method. In that case, you worked with the member reference `Person::age` of the type `KProperty1<Person, Int>`, which lets the compiler know the exact types of the receiver and the property value. In this example, however, the exact types are unknown, because you enumerate all the properties of an object’s class. Therefore, the `prop` variable has the type `KProperty1<Any, *>`, and `prop.get(obj)` returns a value of `Any?` type. You don’t get any compile-time checks for the receiver type, but because you’re passing the same object from which you obtained the list of properties, the receiver type will be correct. Next, let’s see how the annotations that are used to customize serialization are implemented.

### 12.2.3 Customizing serialization with annotations

Earlier in this chapter, you saw the definitions of annotations that let you customize the process of JSON serialization. In particular, we discussed the `@JsonExclude`, `@JsonName`, and `@CustomSerializer` annotations. Now it’s time to see how these annotations can be handled by the `serializeObject` function.

We’ll start with `@JsonExclude`. This annotation allows you to exclude some properties from serialization. Let’s investigate the implementation of the `serializeObject` function needs to change to support that.

Recall that to get all member properties of the class, you use the extension property `memberProperties` on the `KClass` instance. But now the task gets more complicated: properties annotated with `@JsonExclude` need to be filtered out. Let’s see how this is done.

The `KAnnotatedElement` interface defines the property `annotations`, a collection of all annotation instances (with runtime retention) that are applied to the element in the source code. Because `KProperty` extends `KAnnotatedElement`, you can access all annotations for a property via `property.annotations`.

But the code responsible for excluding properties actually needs to find a specific annotation. For this case, you can use the `findAnnotation` function that can be called on a `KAnnotatedElement`. It returns an annotation of a type specified as an argument if such an annotation is present.

Combining `findAnnotation` with the `filter` standard library function, you can filter out the properties annotated with `@JsonExclude`:

```kotlin
val properties = kClass.memberProperties
        .filter { it.findAnnotation<JsonExclude>() == null }
```

The next annotation is `@JsonName`. As a reminder, we’ll repeat its declaration and an example of its usage:

```kotlin
annotation class JsonName(val name: String)

data class Person(
    @JsonName("alias") val firstName: String,
    val age: Int
)
```

In this case, you’re interested not only in its presence but also in its argument: the name that should be used for the annotated property in JSON. Once again, the `findAnnotation` function helps here:

```kotlin
val jsonNameAnn = prop.findAnnotation<JsonName>()
val propName = jsonNameAnn?.name ?: prop.name
```

If a property isn’t annotated with `@JsonName`, then `jsonNameAnn` is `null`, and you still use `prop.name` as the name for the property in JSON. If the property is annotated, you use the specified name instead.

Let’s look at the serialization of an instance of the `Person` class declared earlier. During the serialization of the `firstName` property, `jsonNameAnn` contains the corresponding instance of the annotation class `JsonName`. Thus `jsonNameAnn?.name` returns the non-`null` value `"alias"`, which is used as a key in JSON. When the `age` property is serialized, the annotation isn’t found, so the property name `age` is used as a key. As such, the serialized JSON output for a `Person("Alice", 35)` object is `{ "alias": "Alice", "age": 35 }`

Let’s combine the changes discussed so far and look at the resulting implementation of the serialization logic.


```kotlin
//Listing 12.2. Serializing an object with property filtering

private fun StringBuilder.serializeObject(obj: Any) {
    (obj::class as KClass<Any>)
        .memberProperties
        .filter { it.findAnnotation<JsonExclude>() == null }
        .joinToStringBuilder(this, prefix = "{", postfix = "}") {
            serializeProperty(it, obj)
        }
}
```

Now the properties annotated with `@JsonExclude` are filtered out. We’ve also extracted the logic responsible for property serialization into a separate `serializeProperty` function.


```kotlin
//Listing 12.3. Serializing a single property

private fun StringBuilder.serializeProperty(
        prop: KProperty1<Any, *>, obj: Any
) {
    val jsonNameAnn = prop.findAnnotation<JsonName>()
    val propName = jsonNameAnn?.name ?: prop.name
    serializeString(propName)
    append(": ")

    serializePropertyValue(prop.get(obj))
}
```

The property name is processed according to the `@JsonName` annotation discussed earlier.

Next, let’s implement the remaining annotation, `@CustomSerializer`. The implementation is based on the function `getSerializer`, which returns the `ValueSerializer` instance registered via the `@CustomSerializer` annotation. For example, if you declare the `Person` class as shown next and call `getSerializer()` when serializing the `birthDate` property, it will return an instance of `DateSerializer`:

```kotlin
import java.util.Date

data class Person(
    val name: String,
    @CustomSerializer(DateSerializer::class) val birthDate: Date
)
```

Here’s a reminder of how the `@CustomSerializer` annotation is declared, to help you better understand the implementation of `getSerializer`:

```kotlin
annotation class CustomSerializer(
    val serializerClass: KClass<out ValueSerializer<*>>
)
```

Here’s how the `getSerializer` function is implemented.


```kotlin
//Listing 12.4. Retrieving the value serializer for a property

fun KProperty<*>.getSerializer(): ValueSerializer<Any?>? {
    val customSerializerAnn = findAnnotation<CustomSerializer>()
            ?: return null
    val serializerClass = customSerializerAnn.serializerClass

    val valueSerializer = serializerClass.objectInstance
            ?: serializerClass.createInstance()
    @Suppress("UNCHECKED_CAST")
    return valueSerializer as ValueSerializer<Any?>
}
```

`getSerializer` is an extension function to `KProperty`, because the function operates on the property. It calls the `findAnnotation` function to get an instance of the `@CustomSerializer` annotation if it exists. Its argument, `serializerClass`, specifies the class for which you need to obtain an instance.

The most interesting part here is the way you handle both classes and objects (Kotlin’s singletons) as values of the `@CustomSerializer` annotation. They’re both represented by the `KClass` class. The difference is that objects have a non-`null` value of the `objectInstance` property, which can be used to access the singleton instance created for the `object`. For example, `DateSerializer` is declared as an `object`, so its `objectInstance` property stores the singleton `DateSerializer` instance. You’ll use that instance to serialize all objects, and `createInstance` won’t be called.

If the `KClass` represents a regular class, you create a new instance by calling `createInstance()`.

Finally, you can use `getSerializer` in the implementation of `serializeProperty`. Here’s the final version of the function.


```kotlin
//Listing 12.5. Serializing a property with custom serializer support

private fun StringBuilder.serializeProperty(
    prop: KProperty1<Any, *>, obj: Any
) {
    val jsonNameAnn = prop.findAnnotation<JsonName>()
    val propName = jsonNameAnn?.name ?: prop.name
    serializeString(propName)
    append(": ")

    val value = prop.get(obj)
    val jsonValue = prop.getSerializer()?.toJsonValue(value)
        ?: value
    serializePropertyValue(jsonValue)
}
```

`serializeProperty` uses the serializer to convert the property value to a JSON-compatible format by calling `toJsonValue`. If the property doesn't have a custom serializer, it uses the property value.

Now that you’ve seen an overview of the implementation of the JSON serialization part of the library, we’ll move to parsing and deserialization. The deserialization part requires quite a bit more code, so we won’t examine all of it, but we’ll look at the structure of the implementation and explain how reflection is used to deserialize objects.

### 12.2.4 JSON parsing and object deserialization

Let’s start with the second part of the story: implementing the deserialization logic. First, recall that the API, like the one used for serialization, consists of a single function. The function needs access to its type parameter at runtime so that it is able to construct the correct resulting object during deserialization. As we previously discussed in 11.3.6, this means its type parameter needs to be marked as `reified`, which also forces the function to be marked as `inline`. That will allow it :

```kotlin
inline fun <reified T: Any> deserialize(json: String): T
```

Here’s an example of its use:

```kotlin
data class Author(val name: String)
data class Book(val title: String, val author: Author)

fun main() {
    val json = """{"title": "Catch-22", "author": {"name": "J. Heller"}}"""
    val book = deserialize<Book>(json)
    println(book)
    // Book(title=Catch-22, author=Author(name=J. Heller))
}
```

You pass the type of object to be deserialized as a reified type parameter to the `deserialize` function and get back a new object instance.

Deserializing JSON is a more difficult task than serializing, because it involves parsing the JSON string input in addition to using reflection to access object internals. The JSON deserializer in JKid is implemented in a fairly conventional way and consists of three main stages: a lexical analyzer, usually referred to as a lexer; a syntax analyzer, or parser; and the deserialization component itself.

The lexical analysis splits an input string consisting of characters into a list of tokens. There are two kinds of tokens: character tokens, which represent characters with special meanings in the JSON syntax (comma, colon, braces, and brackets); and value tokens, which correspond to string, number, Boolean, and `null` constants. A left brace (`{`), a string value (`"Catch-22"`), and an integer value (`42`) are examples of different tokens.

The parser is generally responsible for converting a plain list of tokens into a structured representation. Its task in JKid is to understand the higher-level structure of JSON and to convert individual tokens into semantic elements supported in JSON: key-value pairs, objects, and arrays.

The `JsonObject` interface keeps track of the object or array currently being deserialized. The parser calls the corresponding methods when it discovers new properties of the current object (simple values, composite properties, or arrays).


```kotlin
//Listing 12.6. JSON parser callback interface

interface JsonObject {
    fun setSimpleProperty(propertyName: String, value: Any?)

    fun createObject(propertyName: String): JsonObject

    fun createArray(propertyName: String): JsonObject
}
```

The `propertyName` parameter in these methods receives the JSON key. Thus, when the parser encounters an `author` property with an object as its value, the `createObject("author")` method is called. Simple value properties call `setSimpleProperty`, with the actual token value passed as the `value` argument. The `JsonObject` implementations are responsible for creating new objects for properties and storing references to them in the outer object.

12.8 shows the input and output of each stage for lexical and syntactic analyses when deserializing a sample string. Once again, the lexical analysis divides an input string into a list of tokens; then the syntactic analysis (the parser) processes this list of tokens and invokes an appropriate method of `JSONObject` on every new meaningful element.

![img_17.png](img/img_17.png)

The deserializer then provides an implementation for `JsonObject` that gradually builds a new instance of the corresponding type. It needs to find the correspondence between class properties and JSON keys (`title`, `author`, and `name` in figure 12.8) and build nested object values (an instance of `Author`); only after that it can create a new instance of the required class (`Book`).

The JKid library is intended to be used with data classes, and, as such, it passes all the name-value pairs loaded from the JSON file as parameters to the constructor of the class being deserialized. It doesn't support setting properties on object instances after they’ve been created. This means it needs to store the data somewhere while reading it from JSON, before the construction of the actual object begins.

The requirement to save the components before creating the object looks similar to the traditional Builder pattern, with the difference that builders are generally tailored to creating a specific kind of object. In the case of deserialization, the solution needs to be completely generic. To avoid being boring, we use the term seed for the implementation. In JSON, you need to build different types of composite structures: objects, collections, and maps. The classes `ObjectSeed`, `ObjectListSeed`, and `ValueListSeed` are responsible for building objects and lists of composite objects or simple values appropriately. The construction of maps is left as an exercise for you.

The basic `Seed` interface extends `JsonObject` and provides an additional `spawn` method to get the resulting instance after the building process is finished. It also declares the `createCompositeProperty` method that’s used to create both nested objects and nested lists (they use the same underlying logic to create instances through seeds).

```kotlin
//Listing 12.7. Interface for creating objects from JSON data

interface Seed: JsonObject {
    fun spawn(): Any?

    fun createCompositeProperty(
        propertyName: String,
        isList: Boolean
    ): JsonObject

    override fun createObject(propertyName: String) =
        createCompositeProperty(propertyName, false)
    override fun createArray(propertyName: String) =
        createCompositeProperty(propertyName, true)

    // ...
}
```

You may think of `spawn` as an analogue of `build`—a method that returns the result value. It returns the constructed object for `ObjectSeed` and the resulting list for `ObjectListSeed` or `ValueListSeed`. We won’t discuss in detail how lists are deserialized. Instead, we’ll focus our attention on creating objects, which is more complicated and serves to demonstrate the general idea.

But before that, let’s study the main `deserialize` function that does all the work of deserializing a value.

Listing 12.8. The top-level deserialization function
```kotlin
fun <T: Any> deserialize(json: Reader, targetClass: KClass<T>): T {
    val seed = ObjectSeed(targetClass, ClassInfoCache())
    Parser(json, seed).parse()
    return seed.spawn()
}
```

To start the parsing, you create an `ObjectSeed` to store the properties of the object being deserialized, and then you invoke the parser and pass the input stream reader `json` to it. Once you reach the end of the input data, you call the `spawn` function to build the resulting object.

Now let’s focus on the implementation of `ObjectSeed`, which stores the state of an object being constructed. `ObjectSeed` takes a reference to the resulting class and a `classInfoCache` object containing cached information about the properties of the class. This cached information will be used later to create instances of that class. `ClassInfoCache` and `ClassInfo` are helper classes that we’ll discuss in the next section.

Listing 12.9. Deserializing an object
```kotlin
class ObjectSeed<out T: Any>(
        targetClass: KClass<T>,
        override val classInfoCache: ClassInfoCache
) : Seed {

    private val classInfo: ClassInfo<T> =
        classInfoCache[targetClass]

    private val valueArguments = mutableMapOf<KParameter, Any?>()
    private val seedArguments = mutableMapOf<KParameter, Seed>()

    private val arguments: Map<KParameter, Any?>
        get() = valueArguments +
                seedArguments.mapValues { it.value.spawn() }

    override fun setSimpleProperty(propertyName: String, value: Any?) {
        val param = classInfo.getConstructorParameter(propertyName)
        valueArguments[param] =
            classInfo.deserializeConstructorArgument(param, value)
    }

    override fun createCompositeProperty(
        propertyName: String, isList: Boolean
    ): Seed {
        val param = classInfo.getConstructorParameter(propertyName)
        val deserializeAs =
            classInfo.getDeserializeClass(propertyName)?.starProjectedType
        val seed = createSeedForType(
            deserializeAs ?: param.type, isList
        )
        return seed.apply { seedArguments[param] = this }
    }

    override fun spawn(): T =
        classInfo.createInstance(arguments)
}
```

`ObjectSeed` builds a map from constructor parameters to their values. Two mutable maps are used for that: `valueArguments` for simple value properties and `seedArguments` for composite properties. While the result is being built, new arguments are added to the `valueArguments` map by calling `setSimpleProperty` and to the `seedArguments` map by calling `createCompositeProperty`. New composite seeds are added in an empty state and are then filled with data coming from the input stream. Finally, the `spawn` method builds all nested seeds recursively by calling `spawn` on each.

Note how calling `arguments` in the body of the `spawn` method launches the recursive building of composite (seed) arguments: the custom getter of `arguments` calls the `spawn` methods on each of the `seedArguments`. The `createSeedForType` function analyzes the type of the parameter and creates either `ObjectSeed`, `ObjectListSeed`, or `ValueListSeed`, depending on whether the parameter is some kind of collection. We’ll leave the investigation of how it’s implemented to you. Next, let’s see how the `ClassInfo.createInstance` function creates an instance of `targetClass`.

### 12.2.5 Final deserialization step: callBy() and creating objects using reflection

The last part you need to understand is the ClassInfo class that builds the resulting instance and caches information about constructor parameters. It is used in ObjectSeed. But before we dive into the implementation details, let’s look at the APIs that you use to create objects through reflection.

You’ve already seen the `KCallable.call` method, which calls a function or a constructor by taking a list of arguments. This method works great in many cases, but it has a restriction: it doesn't support default parameter values. In this case, if a user is trying to deserialize an object with a constructor that has default parameter values, you definitely don’t want to require those arguments to be specified in the JSON. Therefore, you need to use another method, which does support default parameter values: `KCallable.callBy`.

```kotlin
interface KCallable<out R> {
    fun callBy(args: Map<KParameter, Any?>): R
    // ...
}
```

The method takes a map of parameters to their corresponding values that will be passed as arguments. If a parameter is missing from the map, its default value will be used if possible. This also provides the extra convenience that you don’t have to put the parameters in the correct order; you can read the name-value pairs from JSON, find the parameter corresponding to each argument name, and put its value in the map.

However, you do need to take care of getting the types right. The type of the value in the `args` map needs to match the constructor parameter type; otherwise, you’ll get an `IllegalArgumentException` at runtime. This is particularly important for numeric types: you need to know whether the parameter takes an `Int`, a `Long`, a `Double`, or another primitive type, and to convert the numeric value coming from JSON to the correct type. To do that, you use the `KParameter.type` property.

The type conversion works through the same `ValueSerializer` interface used for custom serialization. If a property doesn't have an `@CustomSerializer` annotation, you retrieve a standard implementation based on its type.

To do so, you can provide a small function `serializerForType` that provides the mapping between a `KType` and the corresponding builtin `ValueSerializer` objects. To obtain a runtime representation of the types JKid knows about—`Byte`, `Int`, `Boolean` and so on—you can use the `typeOf<>()` function to return their respective `KType` instances:

Listing 12.10. Getting a serializer based on the type of the value
```kotlin
fun serializerForType(type: KType): ValueSerializer<out Any?>? =
        when (type) {
            typeOf<Byte>() -> ByteSerializer
            typeOf<Int>() -> IntSerializer
            typeOf<Boolean>() -> BooleanSerializer
            // ...
            else -> null
        }
```

The corresponding `ValueSerializer` implementations then perform the necessary type checking or conversion. For example, the serializer for `Boolean` values checks that `jsonValue` is indeed a `Boolean` upon deserialization:

Listing 12.11. Serializer for Boolean values
```kotlin
object BooleanSerializer : ValueSerializer<Boolean> {
    override fun fromJsonValue(jsonValue: Any?): Boolean {
        if (jsonValue !is Boolean) throw JKidException("Boolean expected")
        return jsonValue
    }

    override fun toJsonValue(value: Boolean) = value
}
```

The `callBy` method gives you a way to invoke the primary constructor of an object, passing a map of parameters and corresponding values. The `ValueSerializer` mechanism ensures that the values in the map have the right types. Now let’s see how you invoke this API.

The `ClassInfoCache` class is intended to reduce the overhead of reflection operations. Recall that the annotations used to control the serialization and deserialization process (`@JsonName` and `@CustomSerializer`) are applied to properties, rather than parameters. When you’re deserializing an object, you’re dealing with constructor parameters, not properties. In order to retrieve the annotations, you need to find the corresponding property. Performing this search when reading every key-value pair would be exceedingly slow, so you do this once per class and cache the information. Here’s the entire implementation of `ClassInfoCache`.

Listing 12.12. Storage of cached reflection data
```kotlin
class ClassInfoCache {
    private val cacheData = mutableMapOf<KClass<*>, ClassInfo<*>>()

    @Suppress("UNCHECKED_CAST")
    operator fun <T : Any> get(cls: KClass<T>): ClassInfo<T> =
            cacheData.getOrPut(cls) { ClassInfo(cls) } as ClassInfo<T>
}
```

You use the same pattern we discussed in 11.3.6: you remove the type information when you store the values in the map, but the implementation of the `get` method guarantees that the returned `ClassInfo<T>` has the right type argument. Note the use of `getOrPut`: if the `cacheData` map already contains an entry for `cls`, this call simply returns that entry. Otherwise, you call the passed lambda, which calculates the value for the key, stores the value in the map, and returns it.

The `ClassInfo` class is responsible for creating a new instance of the target class and caching the necessary information. To simplify the code, we’ve omitted some functions and trivial initializers. Also, you may notice that instead of `!!`, the actual JKid code in the repository throws an exception with an informative message (which is a good pattern for your own code, as well). Here, it was just omitted for brevity.

Listing 12.13. Cache of constructor parameter and annotation data
```kotlin
class ClassInfo<T : Any>(cls: KClass<T>) {
    private val constructor = cls.primaryConstructor!!

    private val jsonNameToParamMap = hashMapOf<String, KParameter>()
    private val paramToSerializerMap =
        hashMapOf<KParameter, ValueSerializer<out Any?>>()
    private val jsonNameToDeserializeClassMap =
        hashMapOf<String, KClass<out Any>?>()

    init {
        constructor.parameters.forEach { cacheDataForParameter(cls, it) }
    }

    fun getConstructorParameter(propertyName: String): KParameter =
            jsonNameToParam[propertyName]!!

    fun deserializeConstructorArgument(
            param: KParameter, value: Any?): Any? {
        val serializer = paramToSerializer[param]
        if (serializer != null) return serializer.fromJsonValue(value)

        validateArgumentType(param, value)
        return value
    }

    fun createInstance(arguments: Map<KParameter, Any?>): T {
        ensureAllParametersPresent(arguments)
        return constructor.callBy(arguments)
    }

    // ...
}
```
On initialization, this code locates the property corresponding to each constructor parameter and retrieves its annotations. It stores the data in three maps: `jsonNameToParam` specifies the parameter corresponding to each key in the JSON file, `paramToSerializer` stores the serializer for each parameter, and `jsonNameToDeserializeClass` stores the class specified as the `@DeserializeInterface` argument, if any. `ClassInfo` can then provide a constructor parameter by the property name, and the calling code uses the parameter as a key for the parameter-to-argument map.

The `cacheDataForParameter`, `validateArgumentType`, and `ensureAllParametersPresent` functions are private functions in this class. Following is the implementation of `ensureAllParametersPresent`; you can browse the code of the others yourself.

Listing 12.14. Validating that required parameters are provided
```kotlin
private fun ensureAllParametersPresent(arguments: Map<KParameter, Any?>) {
    for (param in constructor.parameters) {
            if (arguments[param] == null &&
                    !param.isOptional && !param.type.isMarkedNullable) {
            throw JKidException("Missing value for parameter ${param.name}")
        }
    }
}
```

This function checks that you provide all required values for parameters. Note how the reflection API helps you here. If a parameter has a default value, then `param.isOptional` is `true` and you can omit an argument for it; the default one will be used instead. If the parameter type is nullable (`type.isMarkedNullable` tells you that), `null` will be used as the default parameter value. For all other parameters, you must provide the corresponding arguments; otherwise, an exception will be thrown. The reflection cache ensures that the search for annotations that customize the deserialization process is performed only once, and not for every property you see in the JSON data.

This completes our discussion of the JKid library implementation. Over the course of this chapter, we’ve explored the implementation of a JSON serialization and deserialization library, implemented on top of the reflection APIs, and using annotations to customize its behavior. Of course, all the techniques and approaches demonstrated in this chapter can be used for your own frameworks as well.

## 12.3 Summary

1. Annotations in Kotlin are applied using the `@MyAnnotation(params)` syntax.
2. Kotlin lets you apply annotations to a broad range of targets, including files and expressions.
3. An annotation argument can be a primitive value, a string, an enum, a class reference, an instance of another annotation class, or an array thereof.
4. Specifying the use-site target for an annotation, as in `@get:JvmName`, allows you to choose how the annotation is applied if a single Kotlin declaration produces multiple bytecode elements.
5. You declare an `annotation class` as a class with a primary constructor where all parameters are marked as `val` properties and without a body.
6. Meta-annotations can be used to specify the target, retention mode, and other attributes of annotations.
7. The reflection API lets you enumerate and access the methods and properties of an object dynamically at runtime. It has interfaces representing different kinds of declarations, such as classes (`KClass`), functions (`KFunction`), and so on.
8. To obtain a `KClass` instance, you can use `ClassName::class` for classes, or `objName::class` for object instances.
9. The `KFunction` and `KProperty` interfaces both extend `KCallable`, which provides the generic `call` method.
10. The `KCallable.callBy` method can be used to invoke methods with default parameter values.
11. `KFunction0`, `KFunction1`, and so on are functions with different numbers of parameters that can be called using the `invoke` method.
12. `KProperty0` and `KProperty1` are properties with different numbers of receivers that support the `get` method for retrieving the value. `KMutableProperty0` and `KMutableProperty1` extend those interfaces to support changing property values through the `set` method.
13. To obtain a runtime representation for a `KType`, you can use the`typeOf<T>()` function.
