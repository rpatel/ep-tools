<template>
    <div>
        <navigation-component/>
        <main-card-component/>
    </div>
</template>

<script>

    import NavigationComponent from './components/NavigationComponent.vue';
    import MainCardComponent from './components/MainCardComponent.vue';

    export default {
        components: {
            NavigationComponent,
            MainCardComponent
        }
    };
</script>