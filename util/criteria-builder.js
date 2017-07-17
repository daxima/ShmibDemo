function Criteria() {
    this._where = {};
    this._limit = 100; 
    this._include = [];
    this._orderby = [];
    this._attributes = [];

    this.where = where;
    this.iLike = iLike;
    this.not = not;
    this.notIn = notIn;
    this.include = include;
    this.orderBy = orderBy;
    this.attributes = attributes;

    this.obj = obj;
    this.objWithAttributes = objWithAttributes;
};

function where(name, value) {
    if (value != null && value.trim().length > 0) {
        this._where[name] = value;
    }
};

function iLike(name, value) {
    if (value != null && value.trim().length > 0) {
        this._where[name] = {
            $iLike: '%'+value+'%'
        };
    }
};

function not(name, value) {
    if (value != null && value.trim().length > 0) {
        this._where[name] = {
            $not: value
        };
    }
};

function notIn(name, value) {
    if (value != null && value.length > 0) {
        this._where[name] = {
            $notIn: value
        };
    }
};

function orderBy(sortName, sortBy){
    if (sortName != null && sortName.trim().length > 0) {
        var localSort = [sortName, sortBy];
        this._orderby.push(localSort);
    }    
}

function include(incl) {
    this._include = incl;
    return this._include;
}

function attributes(attributes){
    this._attributes = attributes;
    return this._attributes;
}

function obj() {
    return {
        where: this._where,
        limit: this._limit,
        include: this._include,
        order: this._orderby
    };
};

function objWithAttributes(){
    return {
        where: this._where,
        limit: this._limit,
        include: this._include,
        order: this._orderby,
        attributes: this._attributes
    };
}

module.exports.new = function () {
    return new Criteria();
};
