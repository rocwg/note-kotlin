# Appendix B. Documenting Kotlin code

This appendix covers writing documentation comments for Kotlin code and generating API documentation for Kotlin modules.

## B.1 Writing Kotlin documentation comments

The format used to write documentation comments for Kotlin declarations is called KDoc. KDoc comments begin with `/**` and use tags starting with `@` to document specific parts of a declaration (just like you might be used to from Javadoc). KDoc uses Markdown (https://daringfireball.net/projects/markdown) as its syntax to write the comments themselves. To make writing documentation comments easier, KDoc supports a number of additional conventions to refer to documentation elements such as function parameters.

Here’s a simple example of a KDoc comment for a function.

```kotlin
//Listing B.1. Using a KDoc comment
/**
 * Calculates the sum of two numbers, [a] and [b]
 */
fun sum(a: Int, b: Int) = a + b
```

To refer to declarations from a KDoc comment, you enclose their names in brackets. The example uses that syntax to refer to the parameters of the function being documented, but you can also use it to refer to other declarations. If the declaration you need to refer to is imported in the code containing the KDoc comment, you can use its name directly. Otherwise, you can use a fully qualified name. If you need to specify a custom label for a link, you use two pairs of brackets and put the label in the first pair and the declaration name in the second: `[an example][com.mycompany.SomethingTest.simple]`.

Here’s a somewhat more complex example, showing the use of tags in a comment.

Listing B.2. Using tags in a comment

```kotlin
/**
 * Performs a complicated operation.
 *
 * @param remote If true, executes operation remotely
 * @return The result of executing the operation
 * @throws IOException if remote connnection fails
 * @sample com.mycompany.SomethingTest.simple
 */
fun somethingComplicated(remote: Boolean): ComplicatedResult { /* ... */ }
```

KDoc supports a number of tags:

1. `@param parameterName, @param[parameterName]` to document a value parameter of a function, or the type parameter of a generic construct.
2. `@return` to document the return value of a function.
3. `@constructor` to document the primary constructor of a class. 
4. `@receiver` to document the receiver of an extension function or property.
5. `@property propertyName` to document a property of a class.
6. `@throws ClassName`, `@exception ClassName` to document exceptions which may be thrown by a function.
7. `@sample` to include the text of the specified function into the documentation text, as an example of using the API being documented. The value of the tag is the fully qualified name of the method to be included.
8. `@see otherSymbol` to include a reference to another class or function in the "See also" block of the documentation.
9. `@author` to specify the author.
10. `@since` to specify the version in which the documented element was introduced.
11. `@suppress` to exclude this piece of documentation during export into human-readable formats.

You can find the full list of supported tags at https://kotlinlang.org/docs/kotlin-doc.html.

::: info From Javadoc to KDoc

Besides the difference in syntax—Markdown in KDoc, HTML in Javadoc, there are some other characteristics worth pointing out if you’re used to writing Javadoc to help ease the transition.

Some Javadoc tags aren’t supported in KDoc:

1. `@deprecated` is replaced with the `@Deprecated` annotation. 
2. `@inheritdoc` isn’t supported because in Kotlin, documentation comments are always automatically inherited by overriding declarations. 
3. `@code`, `@literal`, and `@link` are replaced with the corresponding Markdown formatting.

:::

Note that the documentation style preferred by the Kotlin team is to document the parameters and the return value of a function directly in the text of a documentation comment, as shown in listing B.1. Using tags, as in listing B.2, is recommended only when a parameter or return value has complex semantics and needs to be clearly separated from the main documentation text.

::: warning **Rendered documentation in IntelliJ IDEA and Android Studio**

Besides providing syntax highlighting and navigation for symbols in your KDoc comments, IntelliJ IDEA and Android Studio provide a rendered view option. You can enable it by hovering your cursor close to the line numbers next to your KDoc comment, and select the "Toggle Rendered View" option. This changes the appearance of comments to a variable-width font, and renders references and hyperlinks in place. This is especially handy when you’re browsing sources of libraries and other read-only code, since it makes the distinction between documentation and implementation even more obvious.

:::

## B.2 Generating API documentation

The documentation-generation tool for Kotlin is called Dokka: https://github.com/kotlin/dokka. Just like Kotlin, Dokka fully supports cross-language Java/Kotlin projects. It can read Javadoc comments in Java code and KDoc comments in Kotlin code and generate documentation covering the entire API of a module, regardless of the language used to write each class in it. Dokka supports multiple output formats, including plain HTML, Javadoc-style HTML (using the Java syntax for all declarations and showing how the APIs can be accessed from Java), and Markdown.

You can run Dokka from the command line or as part of your Gradle or Maven build script. The recommended way to run Dokka is to add it to the Gradle build script for your module. Here’s the minimum required configuration of Dokka in a Gradle build script:

```kotlin
plugins {
    id("org.jetbrains.dokka") version "1.7.10"
}

repositories {
    mavenCentral()
}

dependencies {
    // . . .
    dokkaHtmlPlugin("org.jetbrains.dokka:kotlin-as-java-plugin:1.7.10")
}
```

With this configuration, you can run `./gradlew dokkaHtml` to generate documentation for your module in HTML format.

You can find information on specifying additional generation options in the Dokka documentation (https://github.com/Kotlin/dokka/blob/master/README.md). The documentation also shows how Dokka can be run as a standalone tool or integrated into Maven build scripts.
