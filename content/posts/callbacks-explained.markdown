---
title:  "Callbacks Explained"
date: "2015-10-27"
---
## Introduction

Callbacks work on the idea that you can pass functions into other functions as *values*.

Passing a function as a value makes it behave the same way any other variable parameter works, allowing you to call the function you passed in inside . I didn't understand the significance of that at all when I started learning about callbacks, and it makes up the basis of what we'll explore in this article.

## Passing Functions into Functions
First, I'm going to do my own implementation of the Array method [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) which takes in a function as a parameter:

{{< highlight javascript >}}
function map(array, actionToPerformOnEachElement) {
    var newArray = [];
    for(var i = 0; i < array.length; i++){
        newArray[i] = actionToPerformOnEachElement(array[i]);
    }
    return newArray;
}
{{< /highlight >}}

In the above example, `actionToPerformOnEachElement` is an arbitrary function that is passed into map as a *value* so its not being called until it is utilized in the body of map.

The name "actionToPerformOnEachElement" could have been anything; I named it that to illustrate its purpose in the function body. In fact, people usually call the function that they're passing in "callback". Regardless of the function's name, it will be called on every element (each value of i) in the array.

Something very important to notice here is that `actionToPerformOnEachElement` takes in the array element as
an argument. This is one of the most powerful features of callback functions that we will get into more later in
this article.

## Calling our Map Function

Let's make `actionToPerformOnEachElement` a little more concrete by thinking about an example of what it could be. Say we wanted to print each element of the array to the console. Then the function we would pass in would be a `printArrayElement` function that took in an argument called `element` and logged it:

{{< highlight javascript >}}
function printArrayElement(element){
    console.log(element);
}
{{< /highlight >}}

With this in mind, how would the `map` function be called? When calling a function that takes in another function, you are faced with two choices:

1. Use an already-defined function

2. Define the function inline as an anonymous function

I think the first method makes it easier to visualize what is going on, but the second can be more concise
and easier to read once you get the hang of callbacks. I will show both ways. Here is the first:

{{< highlight javascript >}}
var array = [1,2,3,4];

map(array, printArrayElement); // our function that we created before
{{< /highlight >}}

And here is the second:

{{< highlight javascript >}}
var array = [1,2,3,4];
map(array,function(element){
    // instead of using our printArrayElement function,
    // replicate its functionality as an anonymous function
    console.log(element);
});
{{< /highlight >}}

for reference, the output to both of these functions is:

{{< highlight javascript >}}
1
2
3
4
{{< /highlight >}}

Either way the same thing is happening: a function is being defined and then passed into map so that map has access to it within its scope and can call it.

And here we come back to the exciting concept from before when I mentioned that "actionToPerformOnEachElement takes in the array element as an argument". Because `actionToPerformOnEachElement` has access to the scope inside of map, it can act upon map's internal local variables.

## Asynchronous Callbacks

Callbacks become necessary when calling asynchronous functions because of the access they have to the scope of the async functions. Let's look at exactly why that is, by trying a naive method of getting a value out of an async function...

In the below function I will place a NodeJs GET request to [http://httpbin.org/](http://httpbin.org/), a website that exists to let you test HTTP requests. In an effort to make sure that I get information back, I will print the data once I get all of it. First I will show you my **incorrect** initial assumption as to how that would work:

{{< highlight javascript >}}
function makeHTTPRequest() {
    http.request('http://httpbin.org/', function (response){
        var bufferList = [];

        // everytime a chunk of data is received,
        // add that chunk to the bufferList
        response.on('data', function (chunk){
            bufferList.push(chunk);
        });

        // whole response was received
        response.on('end', function (){

            // when finished, concatenate all the buffers that have been collected asynchronously together
            var buffer = Buffer.concat(bufferList);

            // then return one full buffer
            return buffer;
        });
    }).end();
}

// call the function
var result = makeHTTPRequest();

// attempt to log the result
console.log(result);
}

// => this prints: undefined
{{< /highlight >}}

Immediately when `makeHTTPRequest` is called `result` is assigned a value... but there is nothing to return! Though `makeHTTPRequest` has finished, the only thing it did was create event handlers to wait on response data. At the time that the `result` variable is assigned, none of the event handlers inside of `makeHTTPRequest` have fired yet. `makeHTTPRequest` does not have a return value, only its event handlers do.

I tried to return the buffer once I had received the all of the incoming response buffers, but the problem that I didn't foresee was that the variable assignment didn't wait until all of the async delivery of data was finished.

This is where callbacks come into play. By logging my buffer in a callback function, I'll have access to the buffer because I will be executing my callback code *inside* the 'end' event handler ensuring that the buffer is full:

{{< highlight javascript >}}
// this time insert a callback as a parameter to the GET request
function makeHTTPRequest(callback) {
    http.request('http://httpbin.org/', function (response){
        var bufferList = [];

        response.on('data', function (chunk){
            bufferList.push(chunk);
        });

        response.on('end', function (){
            var buffer = Buffer.concat(bufferList);

            /* instead of returning buffer, call the callback on it: the callback could be any function, but since it is called once we have the full buffer, we know that buffer will not be undefined */
            callback(buffer);
        });
    }).end();
}

// call the function with an anonymous function that prints the result
makeHTTPRequest(function (buffer){
    var result = buffer;

    // result is defined because we are in the scope in which buffer has been fully populated
    console.log(result);
});

// => this prints a long buffer
{{< /highlight >}}

In this example the function `callback` takes in the final buffer that contains all of the bytes from the asynchronous request. So when `makeHTTPRequest` is called with a callback function, the callback has direct access to the buffer!

## Conclusion

We use callbacks all of the time without questioning why we need them because they are such an integrated part of the NodeJS syntax. 

Hopefully this article clarified what is going on in the network requests you're writing!
