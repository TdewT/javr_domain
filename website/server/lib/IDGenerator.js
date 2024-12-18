class IDGenerator {
    static currID = 0;

    static getID() {
        return ++IDGenerator.currID;
    }
}