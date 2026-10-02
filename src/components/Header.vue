<script setup lang="ts">
import ApplicationLogo from '@/components/shared/ApplicationLogo.vue';
import AppLink from '@/components/shared/AppLink.vue';
import SearchInput from '@/components/form/SearchInput.vue';
</script>
<template>
    <header
        class="px-15 pt-7.5 pb-10 flex justify-between items-center bg-linear-to-b from-[#000000] via-[#00000082] to-[#00000000]">
        <div class="flex items-center justify-start gap-9">
            <ApplicationLogo class="text-h2" />
            <nav class="flex gap-5">
                <AppLink :to="{ name: 'sessions' }" class="text-overline text-primary">sessions</AppLink>
            </nav>
        </div>
        <div class="flex items-center justify-start gap-8">
            <SearchInput />
            <AppLink :to="{ name: 'home' }" class="btn-primary">sign up</AppLink>
            <AppLink :to="{ name: 'home' }" class="btn-secondary">log in</AppLink>
        </div>
    </header>
</template>