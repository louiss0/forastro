import { glob } from "fast-glob";
import { loadConfig, } from "c12";
import { loadAsciidocConfig, getAsciidocPaths, asciidocConfigObjectSchema, AsciidocProcessorController, } from "./internal";
import { normalizeAsciiDocAttributes } from "./asciidoc";
import { z } from "astro/zod";

describe(
    "Testing internal tools",
    () => {


        test("AsciidocProcessorController is a singleton", () => {

            const [controller1, controller2] = [
                new AsciidocProcessorController(),
                new AsciidocProcessorController()
            ]


            expect(controller1).toBe(controller2)
            expect(controller2).toBe(controller1)


        })

        test(
            `asciidocConfigObjectSchema returns an attributes.sourceHighlighter.
            When the object that is passed in is empty`,
            () => {


                const result = asciidocConfigObjectSchema
                    .parse({})


                expect(result).toHaveProperty("attributes.sourceHighlighter")

            })




        test("fast glob works", async () => {


            const filePaths = await glob("**/*.adoc",)


            expect(filePaths.length).toBeGreaterThan(0)


        })


        test("fast glob only grabs from a specific folder", async () => {


            const filePaths = await glob("**/*.adoc", { cwd: import.meta.dirname })

            expect(filePaths.length).toBeGreaterThan(0)

            expect(filePaths).toContain("mocks/posts/first.adoc")


        })

        test("c12 works", async () => {

            const { config } = await loadConfig({
                cwd: `${import.meta.dirname}/mocks/`,
                name: "asciidoc",
                omit$Keys: true,

            })


            expect(config).toBeDefined()

            expectTypeOf(config).toBeObject()


        })

        const MOCK_FOLDER = `${import.meta.dirname}/mocks`


        describe("Testing getAsciidocPaths", () => {


            it("works", async () => {


                const result = await getAsciidocPaths(`${MOCK_FOLDER}/posts`)

                expect(result).toBeDefined()

                expectTypeOf(result).toBeArray()

                expect(result.length).not.toBe(0)


            })

            it("gets files based on if it's a .adoc or a .asciidoc extension", async () => {



                const result = await getAsciidocPaths(`${MOCK_FOLDER}/posts`)


                expect(result).toBeDefined()


                expectTypeOf(result).toBeArray()


                expect(result.some(value => value.endsWith(".adoc"))).toBeTruthy()

                expect(result.some(value => value.endsWith(".asciidoc"))).toBeTruthy()


            })


            it("gets paths from the specified directory only", async () => {

                const specifiedDirectory = `${MOCK_FOLDER}/posts`;
                const result = await getAsciidocPaths(specifiedDirectory)


                expect(result.every((value) => !value.startsWith(specifiedDirectory)))
                    .toBeTruthy()

            })

            it(
                "throws an error if the folder name that is passed in is empty",
                async () => {


                    try {

                        await getAsciidocPaths('')

                    } catch (error) {

                        expect(error).toBeInstanceOf(z.ZodError)

                        const newError = error as z.ZodError

                        expect(newError.format()).toMatchInlineSnapshot(`
            {
              "0": {
                "_errors": [
                  "Don't pass in an empty string pass in a value with forward slashes and words instead",
                ],
              },
              "_errors": [],
            }
          `)

                    }


                })



        })




        describe("Testing loadAsciidocConfig", () => {


            it("does'nt throw an error on an empty file", async () => {

                // The mock folder has no config's and shouldn't. 
                // Passing the mocks folder prevents creating a random empty folder

                try {
                    const result = await loadAsciidocConfig(`${MOCK_FOLDER}`)

                    expect(Object.keys(result).length).toBe(0)

                } catch (error) {

                    expect(error).toBeUndefined()

                }



            })


            it("works", async () => {



                const result = await loadAsciidocConfig(`${MOCK_FOLDER}/configs`)


                expectTypeOf(result).toBeObject()

                expect(Object.getPrototypeOf(result) === Object.prototype).toBeTruthy()


            })

        })


        it(
            "throws an error when a file is a not an m js or ts file",
            async () => {

                try {

                    const result = await loadAsciidocConfig(
                        `${MOCK_FOLDER}/false-config`
                    )

                    expect(Object.keys(result).length).toBe(0)

                } catch (error) {

                    expect(error).toBeInstanceOf(z.ZodError)


                    const newError = error as z.ZodError


                    expect(newError.errors[0]?.message).toMatchInlineSnapshot(`"The asciidoc config file must be a mts or mjs file"`)

                }


            })

        it("throws an error when the config file doesn't have the right properties", async () => {


            try {

                const result = await loadAsciidocConfig(
                    `${MOCK_FOLDER}/configs/bad-props`
                )

                expect(Object.keys(result).length).toBe(0)

            } catch (error) {

                expect(error).toBeInstanceOf(z.ZodError)

                const newError = error as z.ZodError

                expect(newError.errors.every(
                    error => error?.message.match(/Unrecognized key\(s\) in object: '\w+'/)
                )).toBeTruthy()


            }




        })


    })

describe("normalizeAsciiDocAttributes", () => {
  it("converts empty strings to true", () => {
    const input = { toc: "" };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.toc).toBe(true);
  });

  it("converts single-token CSV with trailing comma to array", () => {
    const input = { tags: "foo," };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.tags).toEqual(["foo"]);
  });

  it("converts single-token CSV with trailing comma and spaces to array", () => {
    const input = { tags: "foo,   " };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.tags).toEqual(["foo"]);
  });

  it("converts multi-token CSV with spaces to array", () => {
    const input = { tags: "foo, bar, baz," };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.tags).toEqual(["foo", "bar", "baz"]);
  });

  it("converts two-token CSV with spaces to array", () => {
    const input = { categories: "tech, programming" };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.categories).toEqual(["tech", "programming"]);
  });

  it("handles mixed alphanumeric and hyphen/underscore tokens", () => {
    const input = { items: "item_1, item-2, item3," };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.items).toEqual(["item_1", "item-2", "item3"]);
  });

  it("does not convert comma-separated values without spaces", () => {
    const input = { tags: "foo,bar" }; // does not match the regex
    const out = normalizeAsciiDocAttributes(input);
    expect(out.tags).toBe("foo,bar");
  });

  it("does not convert single tokens without comma", () => {
    const input = { category: "tech" };
    const out = normalizeAsciiDocAttributes(input);
    expect(out.category).toBe("tech");
  });

  it("leaves non-string values intact", () => {
    const input = { n: 42, flag: false, str: "hello" };
    const out = normalizeAsciiDocAttributes(input);
    expect(out).toEqual(input);
  });

  it("handles mixed attribute types in same object", () => {
    const input = {
      toc: "",
      tags: "foo, bar, baz,",
      category: "tech",
      count: 42,
      enabled: false,
      invalid: "foo,bar" // no space, should not convert
    };
    const out = normalizeAsciiDocAttributes(input);
    expect(out).toEqual({
      toc: true,
      tags: ["foo", "bar", "baz"],
      category: "tech",
      count: 42,
      enabled: false,
      invalid: "foo,bar"
    });
  });

  it("converts dash-case and snake_case keys to camelCase", () => {
    const input = {
      "user-name": "john",
      "api_key": "secret",
      "simple-key": "",
      "multi_word_key": "value, another,"
    };
    const out = normalizeAsciiDocAttributes(input);
    expect(out).toEqual({
      userName: "john",
      apiKey: "secret",
      simpleKey: true,
      multiWordKey: ["value", "another"]
    });
  });

  it("returns a new object (non-mutating)", () => {
    const input = { toc: "", tags: "foo, bar," };
    const out = normalizeAsciiDocAttributes(input);
    
    // Original object should be unchanged
    expect(input.toc).toBe("");
    expect(input.tags).toBe("foo, bar,");
    
    // Output should be different object
    expect(out).not.toBe(input);
    expect(out.toc).toBe(true);
    expect(out.tags).toEqual(["foo", "bar"]);
  });

  it("does not match strings with double spaces/empty tokens", () => {
    const input = { tags: "foo, , bar," }; // Has an empty token - doesn't match our regex
    const out = normalizeAsciiDocAttributes(input);
    expect(out.tags).toBe("foo, , bar,"); // Should stay as string since regex doesn't match
  });

  it("filters out empty strings from arrays when regex matches", () => {
    const input = { tags: "foo, bar," }; // Valid pattern with trailing comma
    const out = normalizeAsciiDocAttributes(input);
    expect(out.tags).toEqual(["foo", "bar"]); // Split and trim, empty strings filtered
  });
});
