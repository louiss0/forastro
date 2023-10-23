# Error Functions

An error function is a function that is created to do something
with errors. They allow the user to do something about errors.

## Throw If

A function that will throw an error when something is true.

```ts
function throwIf(
condition: boolean, 
message = "Something went wrong", 

): asserts condition is false
```

Usage

```ts
    const user = fetch('https://jsonplaceholder.typicode.com/users/1')
    .then((response) => response.json())
    .then((json) => json);

    throwIf(!user, "There is not user here")
```

## Throw Unless

```ts
function throwUnless(
    condition: boolean, 
    message = "Something went wrong", 
    
): asserts condition
```

Usage

```ts

    const user = fetch('https://jsonplaceholder.typicode.com/users/10')
    .then((response) => response.json())
    .then((json) => json);

    throwUnless(user, "There is not user here")
```

## Return Error and Result From Promise

A function that returns a potential result and a potential error.
This is useful for checking if a result is returned or it's an error.

```ts
function returnErrorAndResultFromPromise<T extends Promise<any>>(cb: T): 
Promise<readonly [Awaited<T>, null] | readonly [null, Error]>
```

Usage

```ts
const [result, error] = returnErrorAndResultFromPromise(
    fetch('https://jsonplaceholder.typicode.com/users/10')
    .then((response) => response.json())
    )

    if(error) {

        throw error        

    }
    
    console.log(result)

```
