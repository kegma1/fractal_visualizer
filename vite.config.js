export default {
    root: 'src/',
    publicDir: '../static/',
    base: './',
    server:
    {
        host: true,
        open: true
    },
    build:
    {
        outDir: '../docs',
        emptyOutDir: true,
        sourcemap: true
    }
}