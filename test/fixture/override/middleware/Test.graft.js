var greek = 'beta';

this.greekLetter = greek;
this.loadOrder.push(greek);

this.addInitializer(function(opts) {
    this.initOrder.push(greek);
});
