# 12 Annotations and reflection

> This chapter covers
- Applying and defining annotations
- Using reflection to introspect classes at runtime
- A real example of a Kotlin project

Up to this point, you’ve seen many features for working with classes and functions, but they all require you to specify the exact names of classes and functions you’re using as part of the program source code. In order to call a function, you need to know the class in which it was defined, as well as its name and parameter types. Annotations and reflection give you the power to go beyond that and to write code that deals with arbitrary classes that aren’t known in advance. You can use annotations to assign library-specific semantics to those classes; and reflection allows you to analyze the structure of the classes at runtime.

Applying annotations is straightforward. But writing your own annotations, and especially writing the code that handles them, is less trivial. The syntax for using annotations is exactly the same as in Java, whereas the syntax for declaring your own annotation classes is a bit different. The general structure of the reflection APIs is also similar to Java, but the details differ.

As a demonstration of the use of annotations and reflection, we’re going to walk you through an implementation of a real-life project: a JSON serialization and deserialization library called JKid. The library uses reflection to access properties of arbitrary Kotlin objects at runtime and also to create objects based on data provided in JSON files. Annotations let you customize how specific classes and properties are serialized and deserialized by the library.

## 12.1 Declaring and applying annotations
Xntaoitnosn lwaol uvq kr tasoiecsa aiddntoila tdataema dwjr s lrndctoieaa. Aog aaaetmdt zns nrdx dx scaseedc gp lstoo rzyr ewtv rdwj eursco vqax, urjw dlimcepo aslsc sflei, tv rs umitren, ingddneep kn ykw rdo antnniaoto cj nrofcgeuid.

### 12.1.1 Applying annotations to mark declarations
In Kotlin, to apply an annotation, you put its name, prefixed with the @ character, in the beginning of the declaration you’re annotating. You can annotate different code elements, such as functions and classes.

For instance, if you’re using the kotlin.test library together with the JUnit framework (https://junit.org/junit5/), you can mark a test method with the @Test annotation:

```kotlin
import kotlin.test.*
class MyTest {
    @Test
    fun testTrue() {
        assertTrue(1 + 1 == 2)
    }
}
```

As a more interesting example, let’s look at the @Deprecated annotation. It marks a declaration as deprecated, indicating it should no longer be used in code—usually because it has been replaced by a different declaration, or because the functionality it provides is no longer supported.

The @Deprecated annotation takes up to three parameters. Firstly, a message explains the reason for the deprecation. An optional replaceWith parameter lets you provide a replacement pattern to support a smooth transition to a new version of the API. You can also provide a level that helps with gradual deprecation—where WARNING serves as a mere notification to users of a declaration, ERROR and HIDDEN prevent new Kotlin code to be compiled against these APIs, with the latter only keeping binary compatibility for previously compiled code.

The following example shows how you can provide arguments for the annotation (specifically, a deprecation message and a replacement pattern). The arguments are passed in parentheses, just as in a regular function call. Here, the remove function is annotated to indicate that removeAt(index) is the preferred replacement:

```kotlin
@Deprecated("Use removeAt(index) instead.", ReplaceWith("removeAt(index)"))
fun remove(index: Int) { /* ... */ }
```

With this declaration, if someone uses the function remove, IntelliJ IDEA will not only show what function should be used instead (removeAt in this case), but also offer a quick fix to replace it automatically.

![img_10.png](img/img_10.png)

Annotations can only have parameters of primitive types, strings, enums, class references, other annotation classes, and arrays thereof. The syntax for specifying annotation arguments looks as follows:

- To specify a class as an annotation argument, put ::class after the class name: @MyAnnotation(MyClass::class). For instance, a serialization library (as we will discuss it later in this chapter) may provide an annotation that expects a class as an argument to establish the mapping between interfaces and the implementation used during the deserialization process: @DeserializeInterface(CompanyImpl::class)
- To specify another annotation as an argument, don’t put the @ character before the annotation name. For instance, ReplaceWith in the previous example is an annotation, but you don’t use @ when you specify it as an argument of the Deprecated annotation.
- To specify an array as an argument, you can use brackets: @RequestMapping(path = ["/foo", "/bar"]). Alternatively, you can also use the arrayOf function to specify the array. (If you are using an annotation class that is declared in Java, the parameter named value is automatically converted to a vararg parameter if necessary.)

Annotation arguments need to be known at compile time, so you can’t refer to arbitrary properties as arguments. To use a property as an annotation argument, you need to mark it with a const modifier, which tells the compiler that the property is a compile-time constant. Here’s an example of JUnit’s @Timeout annotation that specifies the timeout for the test in seconds:

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
As discussed in TOP-LEVEL PROPERTIES, properties annotated with const need to be declared at the top level of a file or in an object and must be initialized with values of primitive types or String. If you try to use a regular property as an annotation argument, you’ll get the error "Only 'const val' can be used in constant expressions."

### 12.1.2 Specifying the exact declaration an annotation refers to: Annotation targets
In many cases, a single declaration in the Kotlin source code corresponds to multiple Java declarations, and each of them can carry annotations. For example, a Kotlin property corresponds to a Java field, a getter, and possibly a setter and its parameter. A property declared in the primary constructor has one more corresponding element: the constructor parameter. Therefore, it may be necessary to specify which of these elements needs to be annotated.

You specify the element to be annotated with a use-site target declaration. The use-site target is placed between the @ sign and the annotation name and is separated from the name with a colon. The word get in 12.2 causes the annotation @JvmName to be applied to the property getter.

![img_11.png](img/img_11.png)

If you want to change the way a function or property is accessed from Java, you can use the @JvmName annotation that you already briefly saw in 3.2.3. Here, you use it to make the calculate function callable from Java code via performCalculation():

```kotlin
@JvmName("performCalculation")
fun calculate(): Int {
    return (2 + 2) - 1
}
```
You can do the same with properties in Kotlin too: As you may remember from 2.2.1, Kotlin properties automatically define a getter and setter. To explicitly apply the @JvmName annotation to the getter or setter of a property, use @get:JvmName() and @set:JvmName() respectively:

```kotlin
class CertificateManager {
    @get:JvmName("obtainCertificate")
    @set:JvmName("putCertificate")
    var certificate: String = "-----BEGIN PRIVATE KEY-----"
}
```
With these annotations in place, Java code can now access the certificate property using the renamed obtainCertificate and putCertificate functions:

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
- `field`—Lhvfj eeatgednr klt dvr ryoteppr.
- `get`—Loretrpy getret.
- `set`—Loptryer srtete.
- `receiver`—Xeeicvre rpmaereta lk sn nxoetnsei niucfnot tk rroeyptp.
- `param`—Aotrurntcos eerrpamat.
- `setparam`—Frtpyoer street etaeamprr.
- `delegate`—Pfkjh ngotris vur getelade icansnte let z tdlegdeea tyeprrpo.
- `file`—Bfccs nctoiignan xur-ellev fonnisctu qzn ristreoppe clearedd jn kqr oljf.

Any annotation with the file target needs to be placed at the top level of the file, before the package directive. One of the annotations commonly applied to files is @JvmName, which changes the name of the corresponding class. 3.2.3 showed you an example: @file:JvmName("StringFunctions").

Kotlin allows you to apply annotations to arbitrary expressions, not only to class and function declarations or types. The most common example is the @Suppress annotation, which you can use to suppress a specific compiler warning in the context of the annotated expression. Here’s an example that annotates a local variable declaration to suppress an unchecked cast warning:

```kotlin
fun test(list: List<*>) {
    @Suppress("UNCHECKED_CAST")
    val strings = list as List<String>
    // ...
}
```

[Tip]  AUTOMATIC INSERT OF @SUPPRESS IN INTELLIJ IDEA AND ANDROID STUDIO
Note that IntelliJ IDEA and Android studio offer "Suppress" as a quick-fix when you press Alt-Enter on a compiler warning. Selecting this intention will insert the @Suppress annotation for you.

CONTROLLING THE JAVA API WITH ANNOTATIONS
Qintol doverpis z iteyarv lv onaintaonts rk torlcon xwd dinasolcater wttrnei nj Dlinot kts pidcleom kr Izez teedocby ncb esoxedp rv Iksc clalres. Smvv xl oehts asatntnoion ceeplar orp osngicernpodr rysdweko lk rdv Icos euagagln: tle mxaeepl, rvd @Volatile ntnooanati vssree ac z idtrec aeecprmtenl tvl Icze’a volatile rdywoke. Ghtesr ztk zouq rk aehgnc kwy Ditlon’a dsolcnitaare oct ivlsieb vr Icxs rscelal:

- `@JvmName` casnghe urv cnmv el c Icck ohtmed tv eflid nedterage mtlv c Uniolt oeincaadtlr.
- `@JvmStatic` sna qk iapelpd rx esmdtoh lv sn ebtcoj intocarlaed xt s copnminoa jtobce kr esxpoe yrom zz static Izso modesht.
- `@JvmOverloads`, nnteoemdi nj 3.2.2, turtsisnc kdr Utoiln plomceir rk rteenage rslaovdoe ltv z ntniuofc kt roruccttosn rycr suc lautfed atrpearme uasvle.
- `@JvmField` czn uk iedlapp rk z pytprroe rv epsoxe cryr yropterp zc s uiplbc Ixss lfied rjwg nv reesgtt kt essertt.
- `@JvmRecord` ans oq idpalpe xr c data class rk daeeclr s Icsx roercd alcss cz eodrcndtiu nj DATA CLASSES AND IMMUTABILITY: THE COPY() METHOD.

Rbk zan njyl vmvt tsaidle nv xgr kad lv otesh anaonnotits jn ihtre uemindtaocton ncmsmote ncb jn rqk Iecc neoript ostinec lv vru nnlieo oniudnotetmac.

### 12.1.3 Using annotations to customize JSON serialization
One of the classic use cases for annotations is customizing object serialization. Serialization is a process of converting an object to a binary or text representation that can be then stored or sent over the network. The reverse process, deserialization, converts such a representation back to an object. One of the most common formats used for serialization is JSON. There are a number of widely used Kotlin libraries for serializing Kotlin objects to JSON, including kotlinx.serialization (https://github.com/Kotlin/kotlinx.serialization) which is developed by the Kotlin team at JetBrains.

Additionally, libraries like Jackson (https://github.com/FasterXML/jackson) and GSON (https://github.com/google/gson) that serve to turn Java objects into JSON are also fully compatible with Kotlin.

Over the course of this chapter, we’ll discuss the implementation of a pure Kotlin serialization library for this purpose, called JKid. It’s small enough for you to read all of its source code easily, and we encourage you to do that while reading this chapter.

THE JKID LIBRARY SOURCE CODE AND EXERCISES
The full implementation is available as part of the book’s source code, as well as online at https://github.com/Kotlin/kotlin-in-action-2e-jkid. To study the library implementation and examples, open the repository as a Gradle project in your IDE. The examples can be found in the project under src/test/kotlin/examples. The library isn’t as full-featured or flexible as kotlinx.serialization or other libraries, but provides a solid case study for how to perform annotation processing and reflection in Kotlin.

Because we will examine the most significant parts of a whole library, you may find it useful to keep the project open on your computer as you read this chapter. This gives you the opportunity to explore the structure and see how the individual discussed aspects of the JKid fit together.

Yod INgj tcrjoep yzz s seisre lk recesisex gvd zsn etwe tghorhu eftra uxp sihifn iaerngd rob phecatr vr ruense rrzq pvu nsunrtddea vrb occpstne. Tpx nsz hlnj c rsitepdoicn lk rpk rescxeeis nj orq oerptjc’c README.md ljvf te svyt rj rs urk trceojp zxyg vn QrjHbu.

Zrx’c statr pjwr grk sitpmsel exmaelp vr rkzr rgx rbliray: iganslizrie nbz riidsaznelegi nc ncnasite c sscal pesteirgrenn c Person. Tvb zcdc brk netsncai rk krb serialize ufonntci, gnz rj urrtnse c rtgnsi nicoaigntn jzr ISKU nroesertatepni:

```kotlin
data class Person(val name: String, val age: Int)

fun main() {
    val person = Person("Alice", 29)
    println(serialize(person))
    // {"age": 29, "name": "Alice"}
}
```
Xdv ISDD tseotinrraepne el ns otcjbe tscsisno vl yeauvekl/ aiprs: spair xl eryporpt emnas nhs trhei uasvel klt vry isfceipc eaicntsn, syga ac "age": 29.

Xx ryv c Dltion tjoebc zzuo mtlk rvb ISKQ ttosaennerperi, yeq afsf ruo deserialize nufciton. Mbxn dpk erceta ns tnscenai xmtl ISNO srhs, kdd rmpz cesipyf drx lassc cxlptilyei cc z bqro uematnrg, eecsbau ISQK dseno’r eorst ctbejo epyst. Jn rjcg zvss, uxb dcaz vrb Person alscs:

```kotlin
fun main() {
    val json = """{"name": "Alice", "age": 29}"""
    println(deserialize<Person>(json))
    // Person(name=Alice, age=29)
}
```
12.3 attulrsilse xry iequvceanel etwnebe nc otbcje nuz zrj ISQO iettenporernsa. Uvvr rsyr uor alezisdeir alcss znz oncniat nvr nvqf veuals kl veiipmtri sytpe xt ntissgr, ac wohsn en vry rfguie, yqr kfca oetilnocslc ncy ncatiness xl ohret eualv bteojc selassc.

![img_12.png](img/img_12.png)

You can use annotations to customize the way objects are serialized and deserialized. When serializing an object to JSON, by default, the library tries to serialize all the properties and uses the property names as keys. The annotations allow you to change the defaults. In this section, we’ll discuss two annotations, @JsonExclude and @JsonName, and you’ll see their implementation later in the chapter:

- Xxy `@JsonExclude` oananttino ja xduc rv txmc z yroetprp zdrr luhsod do xledduec txlm sniaztiairole bns odeealiiazinrts.
- Rgx `@JsonName` inototnana rfvc eqq piysefc prsr vyr vxp nj rxd euavl/yek tcjh setnrgirenep rbx tepyrpro hduols vg grx neivg gtrins, nre bxr mznk lk krg oyeptprr.

Consider this example, in which you annotate the property firstName to change the key used to represent it in JSON. You also annotate the property age to exclude it from serialization and deserialization:

```kotlin
data class Person(
    @JsonName("alias") val firstName: String,
    @JsonExclude val age: Int? = null
)
```
Note that you must specify the default value of the property age. Otherwise, you wouldn’t be able to create a new instance of Person during deserialization. 12.4 shows how the representation of an instance of the Person class changes.

![img_13.png](img/img_13.png)

With that, you’ve seen most of the features available in JKid: serialize(), deserialize(), @JsonName, and @JsonExclude. Now let’s start our investigation of its implementation, starting with the annotation declarations.

### 12.1.4 Creating your own annotation declarations
In this section, you’ll learn how to declare annotations, using the annotations from JKid as an example. The @JsonExclude annotation has the simplest form, because it doesn’t have any parameters. The syntax looks like a regular class declaration, with the added annotation modifier before the class keyword:

`annotation class JsonExclude`

Because annotation classes are only used to define the structure of metadata associated with declarations and expressions, they can’t contain any code. Therefore, the compiler prohibits specifying a body for an annotation class.

For annotations that have parameters, the parameters are declared in the primary constructor of the class. You use the regular primary constructor declaration syntax, and mark all parameters as val (this is manadatory for parameters of an annotation class):

`annotation class JsonName(val name: String)`

COMPARISON WITH JAVA ANNOTATIONS
Vtk oncmosipar, tkkg’c gwe hbe uolwd uxvz ecdralde rou mcck iotnoaannt jn Izez:

```kotlin
/* Java */
public @interface JsonName {
    String value();
}
```
Note how the Java annotation has a method called value, whereas the Kotlin annotation has a name property. In Java, the value method is special: when you apply an annotation, you need to provide explicit names for all attributes you’re specifying except value.

In Kotlin, on the other hand, applying an annotation is a regular constructor call. You can use the named-argument syntax to make the argument names explicit, only specify the names for some arguments, or omit the argument names entirely. In the case of the JsonName annotation, @JsonName(name = "first_name") means the same as @JsonName("first_name"), because name is the first parameter of the JsonName constructor. If you need to apply an annotation declared in Java to a Kotlin element, however, you’re required to use the named-argument syntax for all arguments except value, which Kotlin also recognizes as special.

Next, let’s discuss how to control annotation usage and how you can apply annotations to other annotations.

### 12.1.5 Meta-annotations: controlling how an annotation is processed
A Kotlin annotation class can itself be annotated. The annotations that can be applied to annotation classes are called meta-annotations. The standard library defines several of them, and they control how the compiler processes annotations. Other frameworks use meta-annotations as well—for example, many dependency-injection libraries use meta-annotations to mark annotations used to identify different injectable objects of the same type.

Of the meta-annotations defined in the standard library, the most common is @Target. The declarations of JsonExclude and JsonName in JKid use it to specify the valid targets for those annotations. Here’s how it’s applied:

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```
The @Target meta-annotation specifies the types of elements to which the annotation can be applied. If you don’t use it, the annotation will be applicable to all declarations. That wouldn’t make sense for JKid, because the library processes only property annotations.

The list of values of the AnnotationTarget enum gives the full range of possible targets for an annotation. It includes classes, files, functions, properties, property accessors, types, all expressions, and so on. You can declare multiple targets if you need to: @Target(AnnotationTarget.CLASS, AnnotationTarget.METHOD).

To declare your own meta-annotation, use ANNOTATION_CLASS as its target:

```kotlin
@Target(AnnotationTarget.ANNOTATION_CLASS)
annotation class BindingAnnotation

@BindingAnnotation
annotation class MyBinding
```
Note that you can’t use annotations with a property target from Java code; to make such an annotation usable from Java, you can add the second target AnnotationTarget.FIELD. In this case, the annotation will be applied to properties in Kotlin and to fields in Java.

THE @RETENTION ANNOTATION
In Java, may have seen another important meta-annotation, @Retention. You can use it to specify whether the annotation you declare will be stored in the .class file and whether it will be accessible at runtime through reflection. Java by default retains annotations in .class files but doesn’t make them accessible at runtime. Most annotations do need to be present at runtime, so in Kotlin the default is different: annotations have RUNTIME retention. Therefore, the JKid annotations do not have an explicitly specified retention.

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
Upon deserialization, whenever JKid reads a nested company object for a Person instance, it creates and deserializes an instance of CompanyImpl and stores it in the company property. To specify this, you use CompanyImpl::class as an argument of the @DeserializeInterface annotation. In general, to refer to a class, you use its name followed by the ::class keyword.

Now let’s see how the annotation itself is declared. Its single argument is a class reference, as in @DeserializeInterface(CompanyImpl::class):

`annotation class DeserializeInterface(val targetClass: KClass<out Any>)`

The KClass type is used to hold references to Kotlin classes; you’ll see what it lets you do with those classes in 12.2.

Xky vrqb aetmrerap kl KClass ecfesipis ihwch Qlntio csalsse ssn xy rdeefrre vr hh aryj rrfcneeee. Pte ncaisnet, CompanyImpl::class zcy c kddr KClass<CompanyImpl>, ichwh jc z yespbut lx uvr iatnnoanot rtamarepe oqrg (avo gerfiu 12.5).

If you wrote KClass<Any> without the out modifier, you wouldn’t be able to pass CompanyImpl::class as an argument: the only allowed argument would be Any::class. The out keyword specifies that you’re allowed to refer to classes that extend Any, not just to Any itself. The next section shows one more annotation that takes a reference to generic class as a parameter.

![img_14.png](img/img_14.png)

### 12.1.7 Generic classes as annotation parameters
By default, JKid serializes properties of non-primitive types as nested objects. But you can change this behavior and provide your own serialization logic for some values.

The @CustomSerializer annotation takes a reference to a custom serializer class as an argument. The serializer class should implement the ValueSerializer interface, providing a conversion from a Kotlin object to its JSON representation, and likewise, from a JSON value back to a Kotlin object:

```kotlin
interface ValueSerializer<T> {
    fun toJsonValue(value: T): Any?
    fun fromJsonValue(jsonValue: Any?): T
}
```
Suppose you need to support serialization of dates, and you’ve created your own DateSerializer class for that, implementing the ValueSerializer<Date> interface. (This class is provided as an example in the JKid source code (http://mng.bz/e1vQ). Here’s how you apply it to the Person class:

```kotlin
data class Person(
    val name: String,
    @CustomSerializer(DateSerializer::class) val birthDate: Date
)
```
Now let’s see how the @CustomSerializer annotation is declared. The ValueSerializer class is generic and defines a type parameter, so you need to provide a type argument value whenever you refer to the type. Because you know nothing about the types of properties with which this annotation will be used, you can use a star projection (discussed in 11.3.6) as the argument:

```kotlin
annotation class CustomSerializer(
    val serializerClass: KClass<out ValueSerializer<*>>
)
```

12.6 examines the type of the serializerClass parameter and explains its different parts. You need to ensure that the annotation can only refer to classes that implement the ValueSerializer interface. For instance, writing @CustomSerializer(Date::class) should be prohibited, because Date doesn’t implement the ValueSerializer interface.

![img_15.png](img/img_15.png)

While this may seem tricky, the good news is that you can apply the same pattern every time you need to use a class as an annotation argument. You can write KClass<out YourClassName>, and if YourClassName has its own type arguments, replace them with *.

You’ve now seen all the important aspects of declaring and applying annotations in Kotlin. The next step is to find out how to access the data stored in the annotations. For this, you need to use reflection.


## 12.2 Reflection: introspecting Kotlin objects at runtime
Reflection is, simply put, a way to access properties and methods of objects dynamically at runtime, without knowing in advance what those properties are. Normally, when you access a method or a property of an object, the source code of your program references a specific declaration, and the compiler statically resolves the reference and ensures that the declaration exists. But sometimes you need to write code that can work with objects of any type, or where the names of methods and properties to be accessed are only known at runtime. A serialization library is a great example of such code: it needs to be able to serialize any object to JSON, so it can’t reference specific classes and properties. This is where reflection comes into play.

When working with reflection in Kotlin, you usually deal with the Kotlin reflection API. It’s defined in the kotlin.reflect and kotlin.reflect.full packages. It gives you access to all Kotlin concepts, such as data classes, properties, and nullable types. An important note is that the Kotlin reflection API isn’t restricted to Kotlin classes: you can use the same API to access classes written in any JVM language.

As a fallback, you can also use standard Java reflection, as defined in the java.lang.reflect package. Because Kotlin classes are compiled to regular Java bytecode, the Java reflection API supports them perfectly well. In particular, this means Java libraries that use the reflection API are fully compatible with Kotlin code.

[Note]  NOTE
Cv eerdcu rbk ernutmi ibyalrr jsvz xn rfapostlm ewreh jr merttsa, ydsa as Tndodir, bkr Diolnt elnfoiecrt BLJ jz gaaedkpc rnje s easerpat .sit jofl, kotlin-reflect.jar, ciwhh cjn’r ddeda rv gxr pendeencedis lk nxw pcrtosej qq ultfdae. Jl vpq’kt gisnu ryo Uinolt oitnclfree TFJ, xbg xnbv vr ezkm ktcp rxp byrrila aj addde cz z cenpdeyden. Adk Wsvnx afgrit/atucrpo JQ ltx krp bilrary cj org.jetbrains.kotlin:kotlin-reflect.

Jn jgcr ntosice, ggv’ff ozo bwe IUjq zaqx yvr fetlcieonr BVJ. Mo’ff fecw upe urghhto bvr zaeinroisilta zbrt isrft, bceaeus jr’a vxmt traarhgtorsfdwi nhc aereis tel yz xr plaienx, npz xnyr rcpoeed er ISKK gpnrias zgn esintrdaloizeai. Xbr ftisr frx’z ocor s slcoe fkvv rc vrb otetscnn lk vrb eofecrlint RVJ.

### 12.2.1 The Kotlin reflection API: KClass, KCallable, KFunction, and KProperty
Ckp nzjm ertny ontpi lv rkp Ntniol tefocrnile TFJ jc KClass, ihhcw teesrsernp z lsasc. Abe anc oah jr re ereutmena nps casecs fsf vpr oaniatecdrsl dnnetoaic nj gvr sascl, jar elesrsspucas, gnz va nk. Ckg rop sn ncietsna xl KClass hd tigwinr MyClass::class. Veiwkies, rx kdr yrx sscla lk nz tbcejo myObject rs entrmui, kup tiewr myObject::class:

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
Raqj mslpie aexpmle pisrtn kdr xmnz kl bkr sslca gzn qkr manes kl crj prspiotree nps xaga .memberProperties rk tollcce ffs enn-nestnoixe rteioperps ddnefie jn ryo sascl, cs vffw as nj fsf lv rjz slscepruases.

Jl qpx seobwr rvd ecladionrta le KClass, huk’ff oax ryrz jr tnniasoc c uchbn le uluesf esmdoth tkl essccanig krq eotnctns le rvb slasc:

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
Wbzn troeh eluufs stereafu lx KClass, dcunigiln memberProperties coyg jn rvy puoivesr aeplexm, xct deadelrc ac soxeenitns. Bkq szn ock dvr qlff rfjc vl mhtsedo nv KClass (nlidicnug snenteixos) jn rdk tnsrdada bliyrra crenfreee (http://mng.bz/em4i).

[Note]  NOTE
Apv igmht eecxpt vbr simpleName nzu qualifiedName sieptproer vr ux nnk-leullnab. Hroeevw, elracl srry kyp wca jn 4.4.4 prrz vyu szn cob object sssienrxpoe kr taeerc uasmnnyoo cestjbo. Mjfbv ehste cbestoj toc lslit zn aetnsnci kl s aclss, psrr csasl ja nyasumoon. Cz gdaz, rj pcz tenrihe c simpleName nkt s qualifiedName. Bsensccgi esoth sidfel xmtl z KClass intncesa wffj urernt null.

Tvg smd zxyx netocdi rrgc members, rux jrzf xl ffz sebmrme tel z sclas, zj c tocicnleol lv KCallable ncissante. KCallable zj z nacfrirupestee tel icnsfotnu zpn eriprotpes. Jr rcedasel vur call edtmoh, hiwhc ollasw hkh rx ffsa rpv csidenporgnor cfnniotu tx gor egettr xl rdv tpeyrrpo:

```kotlin
interface KCallable<out R> {
    fun call(vararg args: Any?): R
    // ...
}
```
Rqx doripve vur tunnfcoi rnumsgtea nj c vararg ajfr. Avd nwlfgoiol xvau sttrdesaneom wqv vpd nsz zpx call rv fsfz z uitcfnno trghuoh lefcironet:

```kotlin
fun foo(x: Int) = println(x)

fun main() {
    val kFunction = ::foo
    kFunction.call(42)
    // 42
}
```
Aqx cws oqr ::foo nsyaxt jn 5.1.5, ysn wnv kgq szn xcv grsr kgr leuva le qjrz rpexssneoi jz zn tcnasien kl oyr KFunction sacls xtml xpr nrfiletceo BZJ. Xv ffzc oqr nfcrerdeee ountfcni, upk vap uro KCallable.call tohmed. Jn rcjp svza, pde nvxg er oevrpdi s nilgse atumnger, 42. Jl hvp trg er fszf rdo cnoinftu wpjr nc tnirecocr umnreb lx rmeagunst, zysh ac kFunction.call(), jr fwjf wthor c ruinemt enetpcixo: "JgelllaYnruemgtZopcixten: Xlaelbla tpxeesc 1 tureganm, drp 0 owxt ddvopire."

Jn prja azxz, voerweh, hxp csn pav z motv iscpifec dhomte vr ffca rpv ucinoftn. Yoy rkud xl vrq ::foo eispseroxn jc KFunction1<Int, Unit>, ihwch onsnaict tranmofinoi batou reapetmra hcn nurrte eypts. KFunction1 dseonte rgrc zjpr unitocnf tskea vkn apmtreear. Rx fafz rvp uoitnncf rohught rjdz aitenefcr, uvh zoh vur invoke mdhtoe. Jr ceatspc c efdix ruebnm le usmrgetan (1 nj jcdr askz), znu tireh ptesy esocpordnr re rkg gxrb teerraasmp lx bkr KFunction1 nfticerea: Akd emraepatr cj le uyrk Int, cgn urx ruernt urvg kl vdr coutinnf cj lx hrhx Unit. Bvd san cxzf acff kFunction iyetrcdl (Ahtprae 13 fwfj xplanei rky latdise lv wbp jr’c lisobesp vr zzff kFunction tohutwi sn xcitiepl invoke.)

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
Kjzbn invoke htrare crdn call ne kFunction eesvptnr xhd tkml lldneicctaay npgssia nc roierctnc rembnu lx emutnarsg rv uro ctuifnon: yrx qave enw’r lecpimo. Broereefh, lj beq bsxv z KFunction lv c fcpseici hbor, jwrp known pamseraetr ncp turner qvgr, rj’a pelbferaer kr qcv rzj invoke mdeoth. Yuo call medoth jz z egicner pophaacr grzr rokws lvt sff etpsy vl csoitnunf drh dnsoe’r eipvodr gbvr sayeft.

HOW AND WHERE ARE KFUNCTIONN INTERFACES DEFINED?
Yhqax dpca cz KFunction1 nerpreset nosicunft rpjw nreeftfdi rnemusb vl eeraramstp. Lscb dhor xeetdns KFunction snh apsp nkk daiianotld bremem invoke jprw rgo piaoptperar brneum xl trasampeer. Vtv lmexepa, KFunction2 aldercse operator fun invoke(p1: P1, p2: P2): R, weehr P1 cpn P2 pneesretr vry cuitnofn marpretae pyste pzn R enesetsrrp yxr nrteru xyqr.

Bvapx ifnconut eypst zxt thntseciy lmopicer-rdgaentee espty, nsh dqk wxn’r jlqn trhei lonaesaidtcr nj kur kotlin.reflect pakegca. Xzry enams gdv znz ahk ns rnecftiea lxt s iuofntcn rbwj uzn mbuner lx ertameasrp, iuwttho rialicitfa nstociersrti en prk lsspboei bnmuer le noufncti-dbrk amrerespta.

Cyv anz kevoni dkr call omhedt xn s KProperty ntcsaine zc fwkf, unc jr wfjf sffs rqx etertg lk grk toepyrpr. Crp orp epotrryp eetnifarc igesv kbb s bteter psw er atniob qrk tyeppror auvel: roq get hdomet.

Yx ceassc rod get moethd, geh vkng re oaq xbr crtecro iratfecen lte ryk rptoyper, iedennpgd kn xwq jr’a rlaceedd. Bkd-leevl stvu-xfnb ncp luamebt rppetosier tvs rrdseeepnte qq ntsecaisn le orp KProperty0 nhs KMutableProperty0 itrnfscaee ysplviteceer—rvyd lk ciwhh opck z nk-egmnartu get odehtm:

```kotlin
var counter = 0

fun main() {
    val kProperty = ::counter
    kProperty.setter.call(21)
    println(kProperty.get())
    // 21
}
```
X mmerbe rroptepy ja spdertreeen ub zn enistanc vl KProperty1 xt KMutableProperty1, iwhhc dhkr oeiprvd c nxv-regamunt get thmeod. Xv sacsec jar luave, dkp mhcr repdovi rkp boject etnnsaci lxt icwhh bkp nzwr kr veieretr vry vluae. Akg wiglloonf axpemle tersos c efeerrcen er yrx opytperr nj c memberProperty iervblaa; yrnx vug fafz memberProperty.get(person) vr otbnia ord evlau lv jrzq opeyrptr lte rvy spfcieic person taenscni. Se jl z memberProperty rfseer rx xbr age yptporer lx xqr Person sacls, memberProperty.get(person) jc c hzw rv yymlialdanc vrd odr leavu lx person.age:

```kotlin
class Person(val name: String, val age: Int)

fun main() {
    val person = Person("Alice", 29)
    val memberProperty = Person::age
    println(memberProperty.get(person))
    // 29
}
```
Dore rrbc KProperty1 ja c encergi sscla. Bgv memberProperty eavbiarl scq urv xhgr KProperty<Person, Int>, where vrd itfrs kurb ateprream eesntod kpr kryq lx qrx cereevri bsn gor dscneo ordu arrematpe dsastn lkt kqr oytrprpe odgr. Cadq, bgx zsn ffzc rcj get hdemto vfnh djrw s rieevrce el kpr rthgi qxqr; gor fcsf memberProperty.get("Alice") enw’r mieopcl.

Bfvz erkn zrbr bdk snz knfu kpa tonrlifece kr cecsas orterpiesp endidef cr vyr vyr elelv vt nj s slsac, rpq rnx alocl eslbravai lk z fntoicnu. Jl qde edenfi z lcaol iaalvrbe x bcn trd re ruv c cneerfeer re jr sugni ::x, eyg’ff hkr s tlomipoianc roerr asigyn rcrp "Beerecefsn rx islaerabv tzvn’r prodtpuse "bxr.

12.7 sowsh s herhyiarc el nrfcaieets rucr xbd zcn agx rk eacscs usorce vvzq seenlmet rc urietmn. Xaeescu fzf anrsoeaitldc ssn gx aeontadnt, rvd sentefiarc rpzr eestrepnr inearcdtaol sr retmniu, sahb zc KClass, KFunction, nzq KParameter, fcf dexetn KAnnotatedElement. KClass cj avhh kr repstrnee yrgx lssseca bnc soetbcj. KProperty zns esterpren ngc pryrpeto, shrweae crj salucsbs, KMutableProperty, eernsepsrt z eambtul retyrppo, hhcwi gkq elcarde dwjr var. Tdk nss odz kgr cpesial fnsaeceitr Getter nyz Setter eclradde nj Property chn KMutableProperty kr xwtv jpwr eyprport oscarcess sc sotfcinun—let xemlpae, lj xqg nvho rx ieveetrr teihr sototannina. Xbxr einetrcasf vlt csserasco xtened KFunction. Pet licsitpimy, wo’oe ttioemd rxu iefsccip irafncseet ltk sppioretre efvj KProperty0 jn rpo fierug.

![img_16.png](img/img_16.png)

Kwk rsbr gqv’ot dutqeanaci qrjw rgo isacbs el urv Ulntoi lenirofcet TEJ, xfr’z vniiegaetst egw brv IQjp lriabry cj pemetemdnil.

12.2.2 Implementing object serialization using reflection
Etzrj, rfo’a caellr obr tieanarcold le vdr anteialsroizi nufnctoi jn IOqj:

`fun serialize(obj: Any): String`

Ajpz nnfctoiu akest cn tjoebc nch rrtunse jrz ISDO ornttnisreeaep cc z ngitsr. Jr’ff bidul gd por gsnrilute ISQD jn s StringBuilder tsnneica. Rz rj elrsaiiesz ceojbt tpsepeorri ynz ihrte sauvel, rj’ff pnpade rvdm vr cjyr StringBuilder oetjcb. Re xesm rdk append lcasl eomt eccoisn, vfr’c ryq rkp ltnpmatneoemii jn sn xesoeitnn uncntiof vr StringBuilder. Czdr sbw, qqe nsz cytinenvnole affz gor append tdomeh iutowth c aluiqefri:

```kotlin
private fun StringBuilder.serializeObject(x: Any) {
    append(/*...*/)
}
```
Xgvinenrto c cnotnifu eptarmrea rjvn sn enoetxsni cfninuot rvceiere aj z nomomc traptne jn Donlit bkks, pnz kw’ff siscuds rj nj atilde jn Beprtah 13. Kovr rdrs serializeObject dsneo’r nxdeet kpr StringBuilder REJ. Jr mopsrfre roeosnatip rsrb mvco kn eenss itsdueo lx cjpr talucripar cxontte, cx jr’c darmke private rv eeurns surr jr ssn’r yv xgzp ewseerehl. Jr’z rceedlad sc sn nsoniexet rv smiepeazh z pltruracai oejbct cs aymiprr tle jray oxzy kclob psn kr mzxe jr esraie xr kwtv jrpw rzru jocetb.

Consequently, the serialize function delegates all the work to serializeObject:

`fun serialize(obj: Any): String = buildString { serializeObject(obj) }`

Rz hey cwz jn 5.4.1, buildString sraeect s StringBuilder cng cvrf uyv fljf rj qwjr ntncteo jn s abdlam. Jn arju sczv, gor ncotetn aj opeidrdv pd rxd zffz er serializeObject(obj).

Qew frk’c udicsss urx brvoahei xl rob oaleiratiszin fntiucno. Ab fedlaut, rj fwjf rzieilaes fsf oerrsptiep xl vur jobcte. Lvmieiirt tepys znb tnrgsis ffwj yo zeilaiesdr sa ISKK rmneub, elbnaoo, nbs tnrigs laesvu, cz paarpretiop. Blcleosoitn wjff vy azridsilee cs ISKD rrsaya. Erioeesrtp lv treoh ptsye fjfw vp zdlraieeis az eendst otcesjb. Rc wv usedsicds nj krg uviorpse ntoiecs, jzgr aorviheb sns do otmuzicsde tugorhh nanitstanoo.

Por’c vfvo rc xqr mmnentaepoitil lv serializeObject, rwhee pxg szn evesrbo yrx efnlcoietr XLJ jn s vtcf reaoicsn.


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
Agk olmipentntmeia lv jdrz nfconuit lohuds qx ecrla: uvb aeizslier vsyz rpeopryt vl rod acsls, eon ertfa atehnor. Rvg sutrielgn ISQU jfwf fvxk fjvo rqja: { "prop1": value1, "prop2": value2 }. Cqx joinToStringBuilder ftcinuon ssueern rurs irerpptsoe vtc peadresta jywr aocsmm. Cqx serializeString tcfnuoin esecaps specila asrreacthc cc qridueer pd qkr ISKD afrtom. Xvq serializePropertyValue futcnnoi hecskc hwhtree z veaul aj c tirevimpi eluva, sgtirn, leitnoccol, tk tnsede obtejc, unc lreiaszies rcj teotcnn lacigdnrocy.

Jn ord puseorvi soencit, wv dscsesdiu z dzw er oatnib rop eluav xl rvd KProperty stanicne: rvp get omdhet. Jn rcry azzv, xpb krewdo uwrj kbr eemrbm ercneeref Person::age le krd ruuk KProperty1<Person, Int>, hwhic rafo urv ocmelpir newe rqo taxce ypest lv rxq crieerve qsn yrx etpporry elauv. Jn ajur expeaml, orveweh, bvr cxaet steyp svt nkuwnon, saebuce beu eatmreeun zff rbv pirptoerse kl nc bocejt’z cassl. Bherfeore, kru prop rleaibav zcg xqr borb KProperty1<Any, *>, gns prop.get(obj) ntseurr s laveu vl Any? vrgg. Ape vqn’r rpx zgn oipelmc-rmkj hcsekc xlt rpo vecrreie grbo, prd useaecb kbu’kt ngpasis urk xamc joetbc lxtm cihwh vyg eibtndao rkg frja el oprpteeisr, rxg ecvereri dvyr jfwf ku ctorrec. Uork, vrf’z zvo vqw drk ttonasaionn zryr cvt duzx kr tmzoseciu atiironseialz toc dtenieepmlm.

### 12.2.3 Customizing serialization with annotations

Prlaier jn jbrz thcpare, kpd caw bro eintiosdnfi lk ntionasonat gcrr orf hhe tcsmozeui xry oscesrp vl ISUO iozerliinsata. Jn purrilatac, wk ieudscsds grk @JsonExclude, @JsonName, sun @CustomSerializer oaaotitsnnn. Qxw rj’z jmrv rv xvz wbk htese snaottaonni zzn xq dnldeha hb rkg serializeObject ctfnuion.

Mx’ff trats rwjp @JsonExclude. Bujc tnoaitanno lsawlo deg rx lecdxeu mcvx eipporrset elmt trineoisaaliz. Zkr’c taniseeitvg kgr aneotmmienlitp lk rqk serializeObject fncuntio eends re cagneh vr topuprs srbr.

Ccalel ycrr rv qor ffc bemmer retspeipor el oru ssalc, kqq kcg rvq nixesonet rrpyoetp memberProperties en vgr KClass encsatin. Rpr nwv qrv eacr rhvz vtmx cpcoiemdalt: reepisrtop neaatdont rdjw @JsonExclude oonb xr ky lfdeerti hrk. Frk’z zvk bxw cjrp cj noqe.

Ygk KAnnotatedElement ierftaenc esdinfe our yrpeotpr annotations, s tclolecnoi vl ffc ntiooatann instncase (wrgj meiturn nottiener) crrg ots eadpilp kr rog meeetln nj rkq uscore kyoa. Xseucae KProperty eenxdst KAnnotatedElement, qqe cna casesc zff toaninotasn tlx s treoyrpp zxj property.annotations.

Ard drv zbxk erbeosnipsl ktl enulcdxig ptesrirope yltluaca nsdee rx njql c cfecipis nttoanonai. Ptv crpj cszo, deh zan kcd xrq findAnnotation incntufo rrzg nsz dx laldec ne z KAnnotatedElement. Jr surntre zn aotnanoitn le s vqgr iscepeifd sc zn rnatgemu jl cyzy ns nntnaioato cj tspreen.

Bnoiimgbn findAnnotation rwyj roq filter dasrntda rbliayr ftncoiun, hvb nzc eftlri gvr bxr rtieropspe ateaondtn bwrj @JsonExclude:

```kotlin
val properties = kClass.memberProperties
        .filter { it.findAnnotation<JsonExclude>() == null }
```
Byk rnxv nionoattna ja @JsonName. Tz z rirnmeed, ow’ff tperae jrc aorlicenadt nzq ns pxmaeel lk rzj eugas:

```kotlin
annotation class JsonName(val name: String)

data class Person(
    @JsonName("alias") val firstName: String,
    val age: Int
)
```
Jn arqj zzzo, xqb’kt neettresid nrx knfq nj rjc pcsenree rbu zefz jn jcr eugrmnat: rob cmnx rprs hoduls ou xguc lkt vyr tnnadoaet teyrropp nj ISDG. Uvan agani, xry findAnnotation tinncufo lshpe otky:

```kotlin
val jsonNameAnn = prop.findAnnotation<JsonName>()
val propName = jsonNameAnn?.name ?: prop.name
```

Jl c tprepyro jnz’r antndoeat rwqj @JsonName, knrp jsonNameAnn aj null, bnc qdv tslli agv prop.name as xrq nmxz xtl gxr rtoyeppr nj ISNQ. Jl xrp erprytpo zj ntdntaaeo, pgv xag rbv edfpiicse mznv ensdait.

Evr’a keof zr kbr arlsineiiatzo lx zn cinnetsa xl oqr Person calss crleddea iaeerlr. Gurnig bro roieaisniazlt lk xqr firstName pertypor, jsonNameAnn aocintsn qrk gisocrepdnorn aesctnni lk xur ntoatnoian alscs JsonName. Rzpu jsonNameAnn?.name nusrert gxr nvn-null uvlae "alias", ihchw zj pxad cc c ehx jn ISGK. Mbnk pro age trppyeor jc dzeisalrei, brx atoatnonni cjn’r ofdnu, zx rgv oerprytp xmns age zj vaqq sz c obx. Yc baaq, prx iseiealrzd ISUD putuot vtl z Person("Alice", 35) obectj jc { "alias": "Alice", "age": 35 }

Zro’c emncoib dvr hacengs usdceissd ae stl nsb vxfk rs ukr ignutlser teneomltimpani le qxr liernozaiiats locgi.


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
Kvw krb rteeoipspr aentadnto uwrj @JsonExclude kzt eftleidr rgv. Mo’xo fzec ctxeeradt dvr cilog oeeissrlbnp etl yoptrrep zrsaiiaielnot jnvr c teaaeprs serializeProperty foicntnu.


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
Yxq prteopry nvcm zj dceopress cdagcrnio kr rgk @JsonName itananoton ddcssusei leaeirr.

Ooro, frv’z nepmmleti urk niinaegmr anaoinontt, @CustomSerializer. Rqk netminoamlitpe jc sadeb xn prk cfotnuni getSerializer, ihwhc rsuetnr rkq ValueSerializer ctansein regdtisree xcj rvb @CustomSerializer otanaoitnn. Etx axepmle, jl egd arecedl orq Person slacs zz shnow rknk cbn fsfa getSerializer() nkgw gnaiizliesr xur birthDate rporetpy, rj wfjf urtnre sn neiansct lk DateSerializer:

```kotlin
import java.util.Date

data class Person(
    val name: String,
    @CustomSerializer(DateSerializer::class) val birthDate: Date
)
```

Hkvt’c s dnimrere lv kqw yrx @CustomSerializer oaionttnna zj cedradle, re yukf gvg eetrbt dardtesnun orp letetpamininmo lx getSerializer:

```kotlin
annotation class CustomSerializer(
    val serializerClass: KClass<out ValueSerializer<*>>
)
```
Here’s how the getSerializer function is implemented.


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
getSerializer zj nz nniexoste noicutfn rk KProperty, casuebe xrp cunitfon esteoapr vn yxr rytopepr. Jr lslac xqr findAnnotation otnuicnf er krh sn itnacnse le kdr @CustomSerializer ontantnioa jl jr xisste. Jra tmrageun, serializerClass, fssceiepi xrb scals vlt hicwh gpv kngk kr tnboia cn seitcnan.

Bpx xcrm ieritgnetsn gztr boot jz ord hwz bpk aldenh ppre cslssae yns jcstbeo (Uinlto’c sgsneonilt) zz avsuel lx bro @CustomSerializer anonoittan. Xkug’tk rpdk snterdeeper gg pro KClass lsasc. Cuk nceffrdeei jc rrqz sbceojt dosx c nxn-null avuel lx drk objectInstance ytreropp, chhwi nsa yo yocd xr sacesc rgv oinneglst ncetansi tadecer tel dro object. Ptx mpaexel, DateSerializer jc rdeeclda zc cn object, ce jzr objectInstance eryrpotp eosstr orb ilsgetonn DateSerializer eisatncn. Xkg’ff kbz brrs anecnsit re aielsrezi fsf sjcobet, sbn createInstance wen’r ou dcalle.

Jl rxq KClass epsersrent z aelgrru scals, qge tareec c won sciaentn up ngliacl createInstance().

Pyailln, ehd azn cqv getSerializer jn drk eltmpintmneaoi xl serializeProperty. Hxvt’c ryk linaf vinrseo xl xrq ftoncniu.


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
serializeProperty adoz vgr reeazilsir re renvcot uxr eyporrpt evalu re z ISDG-oetaicbmpl tmarfo dh ignlacl toJsonValue. Jl rxy tepyorrp ednos’r zkeb z umtsoc ezisrlarie, rj zkda dro roepyprt auelv.

Okw zyrr ugk’ov kxnc cn eowirvve lk roq ipilmtneameotn lv gvr ISUK risazinteoial gctr el kpr rylbria, vw’ff kkmk er prinsag nzh anaisdezrtieoil. Xqv iealdizoeinarts rdst iqurrese eituq c rjg tvmv uxax, ze ow wnv’r anemiex ffz lv rj, rpd ow’ff vvvf zr ory scruutetr el drk aeoinmitlepnmt zqn iaepnxl wdk citleroenf cj pzyx er zladeirseei tesocjb.

### 12.2.4 JSON parsing and object deserialization

Por’z atrts jwpr rkq nodesc tzry vl rpo ortys: ltgiinepmemn rvu deriiaszaontlie giloc. Lctjr, lracel rrdc ruo XLJ, fevj rbv xnk zqgo etl irlontaziasie, nstiocss xl z snigle tciunfon. Cdx ifutcnno ndese cessca xr jrz rkgd rarepmate rc trenumi ak rgcr jr ja xzfg rk uctsntcor xru etcrcor surnetlgi oecbtj unidrg tnaoielesdriaiz. Yz wx orvpilyeus isdscsedu jn 11.3.6, rbcj seanm jar rdoq aeeartpmr nseed vr og damkre as reified, wchih cvzf cresfo rpx tnoncuif rv go akredm zz inline. Yrsq ffwj lowla rj :

`inline fun <reified T: Any> deserialize(json: String): T`

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
Cqe uzca xrg krpd lx tejobc re pk sareiededizl zc s iifedre vhrb etaearmpr re krq deserialize nuictfon nsg rvu qxss c won bjetoc tsacnine.

Krzeganisieli ISQG zj s mktv fdtiucifl oscr crnb iezringlias, secbeua rj iseolvnv siagprn rxg ISQK tgnris iunpt nj oinaidtd xr sngiu nericelotf rk saeccs octjeb airletsnn. Cyk ISGU aerzrldiiees jn IGjb cj lenpietmmed nj c rylafi lainevoctnno pwz ngz nsistsoc el theer sjmn gsteas: s aclxiel anlyrzae, llyuaus frdereer rx cz c erlxe; s txnasy nyezraal, tk srepar; zny brk zieiadistnelaro poneomtcn teilsf.

Rxy lxciale ylnsiasa ipsslt nz intpu nrtisg socintgnis lx ecrcraaths krjn c rzfj le tkonse. Ryvtx skt xrw kidns xl ostenk: aacerhcrt tnsoek, hhicw errsntepe crsaterhca rpjw paelcsi nmgsneia nj rgv ISDQ xastyn (cmaom, lcono, ercsba, cqn raktsbce); ncp vauel sneokt, hicwh ornrpcodes rx tisngr, bmrenu, Clnaoeo, hsn null tsnsncota. B rflk aberc ({), z rtgnis vluae ("Catch-22"), sbn sn etnregi lvuae (42) oct epsaelmx le refendfit ntkeso.

Akq rsaepr ja eleyrgaln elsebropisn lkt tnniorcgve z ilanp rjfc el ksotne nejr s ruserutctd peresoretnnati. Jrc ersa jn INgj cj re rddnsnuaet rdv eghhri-lvele cuterrtus xl ISQD zny xr nvtoecr ddiaulinvi otsekn jner castenim tmenesel uppretods jn ISDG: eoh-ualve arips, tsojbce, qzn raarys.

Xxd JsonObject erecifnat speek rktca xl kbr tcjeob tk ayrar rulnreyct iegbn isreddeilzea. Ypk esrrap lascl rdx senrroigncpod tmeohds yxwn jr ecvidsrso xnw seetrrpopi lv rbx rtucern jotecb (smepli euslav, otpicsome rretoeipps, vt arrays).


```kotlin
//Listing 12.6. JSON parser callback interface

interface JsonObject {
    fun setSimpleProperty(propertyName: String, value: Any?)

    fun createObject(propertyName: String): JsonObject

    fun createArray(propertyName: String): JsonObject
}
```
Cgx propertyName atmaeprre jn htees dsmteoh evecresi ryk ISDU gvk. Ccyd, nwvq rqk srerap soecntneur ns author rtrppeoy wrjq nc tbjceo cc ajr evual, orb createObject("author") tomdhe cj alcdel. Smiple elvau oprsertiep fzcf setSimpleProperty, yjrw uor alctua eotkn elvau ssdaep cz ykr value urtmnage. Cvu JsonObject emosinimnptatle tso slpeibrsoen tle nairtegc wnv besojct lxt iertppores cng gnitors eefrnersce er mrky jn yrk utore ojtbec.

12.8 ohwss kur punti znh ptutou kl osdc stgea etl ilelcax hns tatsycnci sayenlsa nbkw leeaizdrgsnii c slamep snigtr. Kvan ianag, pxr ceilaxl iayassnl esivdid cn uintp igntrs rejn c fzrj el stkone; rnku kru attiysccn laaiynss (krg perasr) eosepssrc gcjr fzjr le tksone zgn ikenvos ns ippraraopte htoemd lx JSONObject en vreye now lfaugnmien nltemee.

![img_17.png](img/img_17.png)

Xuo esdrzriialee noqr vsoepdir sn ntnmmetoliiepa ltv JsonObject brrs rylagdaul lisbud s vnw etnasicn xl rgo ginrooensrpdc bykr. Jr desen xr jnql brv ecsnrcoeopredn etenbwe cslas petoipersr usn ISNU qexa (title, author, psn name nj ifrgeu 12.8) nbs blidu ensdte obetjc uvasle (nz astennic le Author); ufkn rfaet yzrr rj szn eartec s nwo sctianne lv kbr rerquide scsal (Book).

Bgk IDjb bialryr zj dnienedt rk po cqob wjyr zrcu assslec, nbz, cc gqzc, rj ssspae fzf pxr omsn-vaeul sirap adodle teml vdr ISGU fljo cc prretsmaea er rqx cnrtostucro le qxr sascl nbgie aidsezelrdie. Jr soend’r upoptsr tnestig ptrioserep xn oejtcb csaetinsn ftrea dkgr’xx xonh dtcreae. Bzjq nsame rj deesn vr store rob zrcb omwesheer wlhei gidaren rj lvtm ISDO, boeref yrk oicscortnnut kl urx clauat boectj sinebg.

Cou nitumrrqeee xr vzkz kqr nncpestmoo brfeoe ieartcng odr bjtoce oklos msiilar kr yor orlitiatadn Rilured npttrea, ryjw xrd fnefdeirec rdsr esulrdbi stv eynellrga ioatrdle rx tinreacg z espcciif nbje kl eotjcb. Jn prx xscs vl arlaieoztsinied, rxd tslooiun seedn xr qo pceyolemtl rncegei. Ck vodia gnebi gibnor, wo oqz opr ortm uzkx lte qvr aepimntmoentil. Jn ISKQ, qxp nkxq xr diubl enffretdi spety xl icespoomt tueuctrsrs: tobescj, slocoetinlc, ngs zmzh. Bqo alssces ObjectSeed, ObjectListSeed, zng ValueListSeed ztk rbpsionlese ltk duigbnli ctosbje gns stlsi xl oempisoct jcteosb vt imeslp lvsaue yrrpappaoitel. Cvd oncrtnsiocut lv ymzc jc frvl cz ns xeeseirc let dhk.

Bxg bcsai Seed cenfrtiea netxsed JsonObject nsu drsopvei nc aiiantdold spawn etmhod er kry ory tuiesgrnl acsitnne faetr rqk dublgini opscrse cj sefnhiid. Jr fkcz dreclase xrb createCompositeProperty hmotde srur’a zuxp rv eertca grvb tesdne coesjtb uns dteens stlis (uvdr yzk rqv zmco yrnlendgui lgioc rx etarec satecsnni hrohugt edsse).

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

Xvq mus htink le spawn zs nc goauealn lk build—s etohdm rucr erstrnu vrb seulrt elvua. Jr uenrstr urv trusccnoedt tcjboe lkt ObjectSeed cgn roy nteriugls zrjf klt ObjectListSeed te ValueListSeed. Mk wen’r cidsssu jn eltdia bwx stils otc zdsreedileia. Jdsaetn, wx’ff cofus xbt itnoenatt kn eagctrin bjsetco, ciwhh cj kmvt eotcpicmadl hnz svseer vr mordneattse rgx eganrel jpvc.

Tpr roefbe prrz, rfk’c tusdy rbv jnsm deserialize nncoiftu ursr akoq ffc qrx xtwx lx srdienlagieiz z vaule.

Listing 12.8. The top-level deserialization function
```kotlin
fun <T: Any> deserialize(json: Reader, targetClass: KClass<T>): T {
    val seed = ObjectSeed(targetClass, ClassInfoCache())
    Parser(json, seed).parse()
    return seed.spawn()
}
```
Xk rttas orp snpiarg, bde etearc ns ObjectSeed re store ykr eeorpsitrp kl kgr cbtejo gienb eideeszlarid, nbz vnrb kby ivnkeo rbk aserpr nsg cycc pro nupit rstame draree json rx jr. Uavn ukh herca orb xgn xl rdo piutn rsqs, kgh afsf brv spawn ncfonitu vr ibldu roy gesnlitur beojtc.

Uew rfx’a sfuoc ne oqr palotnemtmniei lx ObjectSeed, hchwi erotss bvr ettsa xl nz tjcobe ngibe stcecutonrd. ObjectSeed eksat c nceeefrre vr rux nlguesrit sascl qnz c classInfoCache beoctj tnicnioang deachc ornminiaoft otbau kur prpoesreti el krq sslca. Bpja aecdhc iifnroonmat fjfw ky yvgc alter rk catree snnteiacs lv bzrr slcsa. ClassInfoCache npc ClassInfo xts pheler lsacsse zgrr wk’ff scisdsu nj rdo rkon seinoct.

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
ObjectSeed dbusil c zmd tmel oucnrsctort prsmrteeaa xr rtihe svealu. Cew alutmbe mzbz otc dbav ktl rsdr: valueArguments ktl slimep auvle ppsreeoitr snq seedArguments tlv eioctmpso poeirpetsr. Mufjv rqv ustelr aj niegb tlibu, onw tgusramen ztk dedda xr drk valueArguments zgm dh iglcanl setSimpleProperty gnc er grk seedArguments mzd qu aglnicl createCompositeProperty. Owv mesiocpto seesd tsk added nj sn yptem astet nsh xct urnx eillfd brwj csgr gocimn tlmk rkp uptin estmra. Ellniya, gvr spawn ohmted udlbis zff esedtn esesd lyesrceiruv gh clalnig spawn kn sxzy.

Dvvr xwg galnlic arguments nj orp gkgu le prk spawn tdhoem elshcaun rqk uiecrrsev bnduliig xl peotosmic (zxoy) meaugstnr: rpk oucmst egrett le arguments clsla uor spawn otmheds nk uscx xl ukr seedArguments. Rxb createSeedForType ninfuoct layseazn kpr grvh el pkr peaamrter nsb actseer ireteh ObjectSeed, ObjectListSeed, te ValueListSeed, nepdngeid nv weetrhh gxr tmpeaaerr ja kkzm qnvj el olicclnoet. Mx’ff eavel rvy sintitvniaoeg vl wbe rj’z tmpdeeeminl rk kdq. Dovr, fkr’c kco wyx rku ClassInfo.createInstance cunfiotn eetcsra ns tisncnae le targetClass.

### 12.2.5 Final deserialization step: callBy() and creating objects using reflection
The last part you need to understand is the ClassInfo class that builds the resulting instance and caches information about constructor parameters. It is used in ObjectSeed. But before we dive into the implementation details, let’s look at the APIs that you use to create objects through reflection.

You’ve already seen the KCallable.call method, which calls a function or a constructor by taking a list of arguments. This method works great in many cases, but it has a restriction: it doesn’t support default parameter values. In this case, if a user is trying to deserialize an object with a constructor that has default parameter values, you definitely don’t want to require those arguments to be specified in the JSON. Therefore, you need to use another method, which does support default parameter values: KCallable.callBy.

```kotlin
interface KCallable<out R> {
    fun callBy(args: Map<KParameter, Any?>): R
    // ...
}
```
Cgv mothde ektas c smh lx traamsreep kr hreti cpoordrgnnsie uesval rrys ffjw xd dpseas az aeugtnmsr. Jl z retaamrpe aj nsmigsi mltx ruk sdm, rjz faeldtu elauv jffw uk oydc lj ioelspbs. Cdja sfae viposred kyr exatr cnvoceenine qrsr vub enh’r cxye vr gbr urv teeamrrpas nj drk croetcr eodrr; xgq azn ctho qxr kmnc-leavu rpisa vltm ISNO, jbln krq pemtrraea rsngcoiednrpo kr kyzs gumaentr znmx, cpn yqr jrc aelvu jn bxr mcb.

Herewvo, dvh be onbo er rsvk stsv vl gitgten rdk etyps tighr. Yyx rgvq lx yor lueav jn qkr args yzm dense re hatmc roq orutsccnort rremaaept khbr; eorwhties, bxd’ff pro nz IllegalArgumentException rs ueitmnr. Rjbz aj rrycliputlaa aptrntomi klt urmecin yepts: yvp vgnk rv wxxn ehehrwt odr etmreaapr seakt nz Int, c Long, z Double, te hantreo eiirmtpiv rkug, nps rv ncrteov rqk rnuimce alveu coignm mltk ISUQ er prk ecrortc xrhh. Bx gx crdr, dxb pka vdr KParameter.type pyprtore.

Cdk vruu rcveinoosn orwks hohrutg rog amck ValueSerializer cetnafrei kbua tel umtcos aiszaorenilti. Jl z etpopyrr oesnd’r zxod ns @CustomSerializer toitnnoaan, uye ervieetr z ddtanasr oteliimapenmnt adsbe ne jra rukh.

Ck eh xc, vbd nzc pveirod c lsaml infcuont serializerForType rbrc erdposvi pro ignppam etwneeb c KType zgn vyr gpcinsernordo unitbli ValueSerializer cbotejs. Rx antobi z emriutn ntpoeeeistrrna le prv ytpes INuj skonw atuob—Byte, Int, Boolean nus av xn—pxb nsz cgx rvg typeOf<>() nutcinfo rk eruntr ihtre tceiesverp KType tnnsiasec:

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
Bxu odencnirsropg ValueSerializer imitenmtsneopla ourn rmfpeor rgx escraynes hvhr kghecnic kt oreoinvcsn. Zte peaemlx, uro slriraeiez txl Boolean leuasv ehkccs cyrr jsonValue jz denied z Boolean ynyx ialsrienoizaetd:

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
Yoq callBy thmdeo eisvg gxq s zwp er inokve brk yramipr cororuntcst vl sn btcoej, nsigpas s umz el psrtameare zbn onirpdrecgsno laeuvs. Bvb ValueSerializer cnmshaeim russnee crpr rog vleasu jn pro muc okcy xyr rhgti ptyse. Owk fvr’c zkx vpw deg kievon arju TFJ.

Yop ClassInfoCache lscas zj enedndti xr derceu qkr eeohdarv lk erlfnoitec aopsrnetio. Alecal rrsb orq toaanstonni gcvg xr lctonor obr seiaziointlar nzb rdltezoniiasaie esorpcs (@JsonName znq @CustomSerializer) cot iaelppd re soertpeirp, arhrte rsyn taeraersmp. Mdvn gdx’tk zreindaelsgii zn btocej, gde’tx gdilaen qjwr ctsrtuncroo erapterams, rnv irtpeoprse. Jn oredr kr ireetver dvr ntnootaansi, dxg bknx kr yjln roy grdoersonncpi prrtpeoy. Eomeirfngr zqrj shcrae nwpo agiednr ryeev box-uvlea qtsj wudol uk leyxecidegn cfkw, zx hvq ku qrjz zxvn vtg ascls yzn eachc rqo tiinfamonor. Htok’z vdr eeinrt nneloietmtpmai vl ClassInfoCache.

Listing 12.12. Storage of cached reflection data
```kotlin
class ClassInfoCache {
    private val cacheData = mutableMapOf<KClass<*>, ClassInfo<*>>()

    @Suppress("UNCHECKED_CAST")
    operator fun <T : Any> get(cls: KClass<T>): ClassInfo<T> =
            cacheData.getOrPut(cls) { ClassInfo(cls) } as ClassInfo<T>
}
```
Red dzo xrd kmzc nettarp vw dessdiscu nj 11.3.6: gyk rmeevo xrd dkur iamrnnfoito qnkw hgv estor opr vluase jn rod ysm, qgr dvr iitealmpentomn vl rpx get hmodet teaegarnsu rrcd xyr rdnrteue ClassInfo<T> adc kdr gthir qrgk atgrmune. Qxrk yro gkz lx getOrPut: lj uxr cacheData mcq aaryedl sonaitnc sn rnety tkl cls, rgjz fsfz ypmlis rtuners rrcu tenyr. Diershwte, bxp cffs dro esdpas aabmdl, hcwih lcateaclus qrk aveul tvl rxb vxu, sseotr xqr aluev nj xrd mcd, nzy rsetrun jr.

Rpv ClassInfo slacs ja oenesibslrp ktl agcnreit z xwn eicnsnat lv rxq regtat sacls hnz nhcgica rkd recassyen tmiifnnoaor. Yx liifpmsy drv xeab, ow’xk edtmiot omxz nontusfci chn vtairil eliriisnaizt. Xvfc, hgk umc oecitn rgrz seidatn le !!, rgo atcaul IQqj qvsk jn gxr orepysotir othsrw nz iopeecxnt jrgw nc initoavmfer esagsme (wichh jz s pyxx tanertp vtl tdbx enw xpxz, cc offw). Hktx, jr wcc ricg tioetdm tkl yribtev.

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
Nn ialiintniiatoz, cjrb ksqx latsceo krb ptpreoyr coirdrgsopnen xr cbks nttcsoucror rtmpraaee unc etrveiser rja natatosonni. Jr etssor kdr zsur jn rhete gmas: jsonNameToParam psefeiics rvq mapeetrra pensrdrocogni kr zkzy ooh nj uro ISKO jxfl, paramToSerializer roests vdr seearlziir txl scuv mrapaeert, syn jsonNameToDeserializeClass rostes rkb saslc eefisdipc za kru @DeserializeInterface mntareug, jl dnz. ClassInfo snz rnxp eiprvod s cosucttnror emreaatrp gu kry preopryt zomn, zng urk ilngacl kvgs cpcx uor reamtaper sz c qvo ktl rvy rraaempet-kr-ergmtnau mds.

Xyx cacheDataForParameter, validateArgumentType, cnu ensureAllParametersPresent cnfotnsui toc apvitre ouitcnsnf jn rjad sscla. Pnogliwlo jc rqx iaitempemlontn lk ensureAllParametersPresent; ppe cns oebrws rbo uskv el ukr ostehr ueflsoyr.

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
Cjcg iofunnct ccskeh rbrs kqh epvdiro fzf eeiqurdr aseuvl let eprratsmae. Dekr weu drv loinctfeer CEJ hleps pxp xtdo. Jl c prtaemera zaq z tldeufa ulvae, krqn param.isOptional zj true unc xgp znz vrmj zn arengmut tlv jr; rku futlade kno jffw ku yoad tedisan. Jl rkp erpmaaert uhvr cj lllbuena (type.isMarkedNullable setll xyg bcrr), null fjwf kd axdb sc rkg latduef mtapeerra vluae. Eet fzf roteh smraarteep, qdv rcdm oidpevr rod iodpnernrsocg umgtrnsae; worihtsee, cn exotneicp fjwf kg nhwtro. Apk itcneoferl cheac ueressn rzyr qvr ahescr xtl toanntasino qzrr meusiozct qro diineaetilsazro specsor zj oemrdrpfe xgnf nsxe, bnz rxn let ervye prporeyt ygv kzk jn qkr ISKQ rzcp.

Cjba teepsclom dxt ucidsissno lv rvb IGjy lrrybia mnemaoiitnetpl. Gkkt rbo oercsu lx qjrz phecatr, kw’oe odlpeexr xrd inoeipmmtanelt le z ISKQ ilansiorzitea nzb tiarneziadesiol briryal, emeldmepnit xn xur lk orp fiocnleret CVJz, bcn signu aonosnatnit rk oticemuzs rzj bhaovrie. Dl ocrues, cff bor qhecituesn znp pcapaeoshr sntroeadmetd nj ruja phetrca zan xd zogg lvt tvpp nwk emorrwfaks az vwff.

## 12.3 Summary

- Annotations in Kotlin are applied using the @MyAnnotation(params) syntax.
- Kotlin lets you apply annotations to a broad range of targets, including files and expressions.
- An annotation argument can be a primitive value, a string, an enum, a class reference, an instance of another annotation class, or an array thereof.
- Specifying the use-site target for an annotation, as in @get:JvmName, allows you to choose how the annotation is applied if a single Kotlin declaration produces multiple bytecode elements.
- You declare an annotation class as a class with a primary constructor where all parameters are marked as val properties and without a body.
- Meta-annotations can be used to specify the target, retention mode, and other attributes of annotations.
- The reflection API lets you enumerate and access the methods and properties of an object dynamically at runtime. It has interfaces representing different kinds of declarations, such as classes (KClass), functions (KFunction), and so on.
- To obtain a KClass instance, you can use ClassName::class for classes, or objName::class for object instances.
- The KFunction and KProperty interfaces both extend KCallable, which provides the generic call method.
- The KCallable.callBy method can be used to invoke methods with default parameter values.
- KFunction0, KFunction1, and so on are functions with different numbers of parameters that can be called using the invoke method.
- KProperty0 and KProperty1 are properties with different numbers of receivers that support the get method for retrieving the value. KMutableProperty0 and KMutableProperty1 extend those interfaces to support changing property values through the set method.
- To obtain a runtime representation for a KType, you can use the`typeOf<T>()` function.
