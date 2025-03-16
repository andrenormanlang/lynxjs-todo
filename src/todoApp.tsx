import "@lynx-js/react"

// Render each item
const RenderItem = ({ item }: { item: String }) => {
    return (
        <view className="max-w-md mx-auto my-8">
            <text>{item}</text>
        </view>
    );
};

// TODO : Remove button on the right of the item box
// const RemoveButton = () => {
//     return <view ></view>
// }

const ItemView = ({ text }: { text: String }) => {
    return <view
        // style={{ width: "80%" }}
        className="flex bg-gray-500 flex-grow text-black border-l-8 border-green-500 rounded-md px-3 py-2 w-full md:w-5/12 lg:w-3/12"
    >
        <text className="w-5/4">
            { text }
        </text>
        <text className="rounded-2xl bg-red-600 px-4 py-2 font-bold leading-none text-white w-1/5">
            Remove
        </text>
    </view>
};

export const TodoApp = ({ items }: { items: String[] }) => {

    return (
        <list
            scroll-orientation="vertical"
            list-type="single"
            span-count={1}
            style={{
                width: "100%",
                height: "100vh",
                listMainAxisGap: "5px",
                padding: "10px",
            }}
            className="flex flex-wrap gap-4 p-6 justify-center text-lg font-serif"
        >
            {
                items.map((item, i) => {
                    return <list-item
                        item-key={`list-item-${i}`}
                        key={`list-item-${item}`}
                    >
                        <ItemView text={item}/>
                    </list-item>
                })
            }
        </list>
        // <RenderItem item={"hello"} />
    )
}
