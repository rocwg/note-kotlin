

```Java
public static void main(String[] args) {
    List<List<String>> listOfLists = Arrays.asList(
            Arrays.asList("1", "2"),
            Arrays.asList("5", "6"),
            Arrays.asList("3", "4")
    );
    //嵌入的list合并为一个list
    List<String> result = listOfLists.stream().flatMap(Collection::stream).collect(Collectors.toList());
    System.out.println(result);
    //求和
    IntStream intStream = listOfLists.stream().flatMapToInt(childList -> childList.stream().mapToInt(Integer::new));
    System.out.println("sum: " + intStream.peek(System.out::println).sum());
}
```
