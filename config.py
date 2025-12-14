from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

load_dotenv()




model = ChatOpenAI(temperature=0, model="gpt-4o-mini")
chat_model = ChatOpenAI(temperature=0, model="gpt-4o")
json_parser = JsonOutputParser()
str_parser = StrOutputParser()