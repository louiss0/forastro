<template>
    <Layout>
        <template #home-features-after>
            <section aria-label="extra-info">
                <div class="container">
                    <div class="spaced-box">
                        <p>This repo is a large collection of libraries that are created by
                            <LinkToSheltonsGitHub />
                        </p>
                    </div>
                </div>
            </section>
        </template>
    </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';

const { Layout } = DefaultTheme;



</script>

<style lang="postcss">
:root {
    --primary-text-color: hsl(0, 0%, 0%, .8);

    --accent-text-color: hsl(22, 100%, 50%);

    --accent-text-color-light: hsl(22, 100%, 70%);

    --accent-text-color-lighter: hsl(22, 100%, 60%);

    --accent-text-color-dark: hsl(22, 100%, 40%);

    --accent-text-color-darker: hsl(22, 100%, 30%);

    --primary-bg-color: hsl(0, 0%, 100%);

    --vp-c-brand: var(--accent-text-color);
    --vp-c-brand-light: var(--accent-text-color-light);
    --vp-c-brand-lighter: var(--accent-text-color-lighter);
    --vp-c-brand-dark: var(--accent-text-color-dark);
    --vp-c-brand-darker: var(--accent-text-color-darker);

}

section[aria-label="extra-info"] {
    padding: 2rem 4rem;
    min-height: 10rem;

    .container {
        width: 60%;
        max-width: 768px;
        margin: 0 auto;
    }


    .spaced-box {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .shelton-link {
        text-decoration: underline;
        text-underline-offset: .25rem;
        text-decoration-color: currentColor;
        padding: .25rem .50rem;

        &:is(:focus-visible, :hover) {
            color: var(--primary-bg-color);
            outline: none;
            background-color: var(--accent-text-color);
            transition: background-color 300ms ease-in;
        }
    }



}
</style>

<component lang="vue" name="LinkToSheltonsGitHub">
    <template>
        <a href="https://github.com/louiss0" class="shelton-link">
            Shelton Louis
        </a>
    </template>
</component>


<style>
@import "../styles/dark-theme.css";

</style>