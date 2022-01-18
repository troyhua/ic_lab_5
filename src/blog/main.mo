import List "mo:base/List";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor {

    public type Message = {
        content: Text;
        time: Time.Time;
        author: Text;
    };

    public type Microblog = actor {
        follow: shared(Principal) -> async ();
        follows: shared query () -> async [Principal];
        post: shared (Text) -> async ();
        posts: shared query () -> async [Message];
        timeline: shared () -> async [Message];
        set_author: shared(Text) -> async();
        get_auther: shared query () -> async Text;
    };

    stable var followed : List.List<Principal> = List.nil();
    stable var author_: Text = "";

    public shared func set_author(author: Text): async () {
        author_ := author;
    };

    public shared query func get_author(): async Text {
        return author_;
    };

    public shared func follow(id: Principal): async () {
        followed := List.push(id, followed);
    };

    public shared query func follows() : async [Principal] {
        List.toArray(followed);
    };

    var messages : List.List<Message> = List.nil();

    public shared func post(text: Text) : async () {
        let msg = {
            content = text;
            time = Time.now();
            author = author_;
        };
        messages := List.push(msg, messages);
    }; 

    public shared query func posts() : async [Message] {
        List.toArray(messages);
    };

    public shared func timeline() : async [Message] {
        var all : List.List<Message> = List.nil();
        for (id in Iter.fromList(followed)) {
            let canister: Microblog = actor(Principal.toText(id));
            let msgs = await canister.posts();
            for (msg in Iter.fromArray(msgs)) {
                all := List.push(msg, all);
            };
        };
        List.toArray(all);
    };

};