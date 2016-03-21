var DataRepository;
(function (DataRepository) {
    var DataStreamElement = (function () {
        function DataStreamElement(owner, value) {
            this.value = value;
            this.owner = owner;
        }
        return DataStreamElement;
    }());
    DataRepository.DataStreamElement = DataStreamElement;
})(DataRepository || (DataRepository = {}));
//# sourceMappingURL=DataRepository.js.map