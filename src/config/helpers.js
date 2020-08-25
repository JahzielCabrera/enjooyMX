
module.exports = {
    ifEquals: function(a, b, options){
        if( a == b ){
            return options.fn(this);
        }
        return null;
    }
}