from config import chat_model, PromptTemplate, str_parser



chat_prompt = """You are a helpful assistant specialized in processing insurance claims. your task is to answer user questions according to the provided insurance claim data 
you can use your knowledge but dont go out of context of the claim data. here is the claim data : {claim_data} 
and here is the user question : {user_question}"""

chat_template = PromptTemplate(
    input_variables=["claim_data", "user_question"],
    template=chat_prompt,
)

chain = chat_template | chat_model | str_parser

global chat_history
chat_history = []


async def chat_agent(claim_data : str, question : str) -> str:
    """
    Processes user queries related to insurance claims using the chat model.
    It maintains a chat history to provide context for ongoing conversations.
    """

    # --- Input Variables Mapping ---
    claim_data = claim_data
    user_question = question

    # --- Prepare Chat History ---
    history_str = "\n".join([f"User: {q}\nAssistant: {a}" for q, a in chat_history])
    if history_str:
        history_str += "\n"

    # --- Generate Response ---
    response = await chain.ainvoke(
        {
            "claim_data": claim_data,
            "user_question": history_str + user_question,
        }
    )

    chat_history[:] = chat_history[-9:]
    # --- Update Chat History ---
    chat_history.append((user_question, response))

    return response


async def chat_agent_stream(claim_data: str, question: str):
    """
    Streams responses for user queries related to insurance claims.
    """
    user_question = question

    # --- Prepare Chat History ---
    history_str = "\n".join([f"User: {q}\nAssistant: {a}" for q, a in chat_history])
    if history_str:
        history_str += "\n"

    # --- Stream Response ---
    full_response = ""
    async for chunk in chain.astream(
        {
            "claim_data": claim_data,
            "user_question": history_str + user_question,
        }
    ):
        full_response += chunk
        yield chunk

    # --- Update Chat History ---
    chat_history[:] = chat_history[-9:]
    chat_history.append((user_question, full_response))