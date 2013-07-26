this.description = 'a submodule on the server-only system';


this.addInitializer(function() {
    Graft.bundle('shared', '../lib/server.bundle.js', __dirname);
});
