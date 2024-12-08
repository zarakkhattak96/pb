export const htmlTemplate = (props: { title: string; address: string }[]) => {
	return `<html>
        <head></head>
        <body>

         <h1> Following are the titles of given websites: </h1>

    <ul>
        ${props.map((p) => `<li> ${p.address} - ${p.title} </li>`).join("")}
    </ul>
    </body>

        </html>`;
};
